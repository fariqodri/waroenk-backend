import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { nanoid } from 'nanoid';
import admin from 'firebase-admin';

import { OrderService } from '../order/services/order.service';
import { ChatDto } from './chat.dto';
import { UsersService } from '../users/services/users.service';
import { ChatRoomRepository } from './repositories/chat-room.repository';
import { ChatRepository } from './repositories/chat.repository';
import { OrderEntity } from 'src/order/entities/order.entity';
import { ChatEntity } from './entities/chat.entity';
import { ResponseBody } from '../utils/response';
import * as serviceAccount from './service_account.json';
import { FIREBASE_DATABASE_URL } from '../constants';
import { ShopService } from '../shop/shop.service';

@Injectable()
export class ChatService {
  private readonly firebaseApp: admin.app.App

  constructor(
    private readonly orderService: OrderService,
    private readonly userService: UsersService,
    private readonly chatRoomRepo: ChatRoomRepository,
    private readonly chatRepo: ChatRepository,
    private readonly shopService: ShopService
  ) {
    this.firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
      databaseURL: FIREBASE_DATABASE_URL,
    });
  }

  async chat(
    body: ChatDto,
    senderId: string,
    senderRole: 'seller' | 'buyer',
  ): Promise<void> {
    const sender = await this.userService.findUserById(senderId);
    const receiver = await this.userService.findUserById(body.receiver_user_id);
    const seller = senderRole === 'seller' ? await this.shopService.getShopByUserId(sender.id) : await this.shopService.getShopByUserId(body.receiver_user_id)
    const receiverDeviceToken = receiver.device_token;
    const { chat_room_id, date, time, text, order_id } = body;

    let order: OrderEntity = null;
    if (order_id) {
      order = await this.orderService.findOrderById(order_id);
    }
    let chat: Partial<ChatEntity> = {
      id: nanoid(11),
      date: date,
      time: time,
      text: text,
      order: order,
      sender: sender,
      receiver: receiver,
    };

    if (chat_room_id) {
      try {
        const room = await this.chatRoomRepo.findOneOrFail(chat_room_id);
        chat = {
          ...chat,
          room: room,
        };
        await this.chatRepo.insert(chat);
      } catch(err) {
        throw new ConflictException(new ResponseBody(null, 'chat room has not been created'))
      }
    } else {
      const room = this.chatRoomRepo.create({
        id: nanoid(11),
        buyer: sender,
        seller: receiver,
      });
      await this.chatRoomRepo.insert(room);
      chat = {
        ...chat,
        room: room,
      };
      await this.chatRepo.insert(chat);
    }
    
    if (receiverDeviceToken) {
      let notificationBody: string
      if (text) {
        notificationBody = text
      } else if (order_id) {
        notificationBody =  `${senderRole === 'seller' ? seller.shop_name: sender.full_name} mengirim sebuah pesan`
      }
      await this.firebaseApp.messaging().sendToDevice(
        receiverDeviceToken,
        {
          data: {
            chat_id: chat.id,
            order: JSON.stringify(order),
            room: JSON.stringify(chat.room),
            text: chat.text,
            date: chat.date,
            time: chat.time,
          },
          notification: {
            title: `Pesan dari ${senderRole === 'seller' ? seller.shop_name : sender.full_name}`,
            body: notificationBody,
            clickAction: "FLUTTER_NOTIFICATION_CLICK"
          }
        },
        {
          collapseKey: 'Waroenk UMKM',
        },
      );
    }
  }
}
