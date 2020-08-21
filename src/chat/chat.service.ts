import { Injectable, ConflictException } from '@nestjs/common';
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
  private readonly firebaseApp: admin.app.App;

  constructor(
    private readonly orderService: OrderService,
    private readonly userService: UsersService,
    private readonly chatRoomRepo: ChatRoomRepository,
    private readonly chatRepo: ChatRepository,
    private readonly shopService: ShopService,
  ) {
    this.firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
      databaseURL: FIREBASE_DATABASE_URL,
    });
  }

  async chat(body: ChatDto, senderId: string, senderRole: 'seller' | 'buyer') {
    const sender = await this.userService.findUserById(senderId);
    const receiver = await this.userService.findUserById(body.receiver_user_id);
    const seller =
      senderRole === 'seller'
        ? await this.shopService.getShopByUserId(sender.id)
        : await this.shopService.getShopByUserId(body.receiver_user_id);
    const receiverDeviceToken = receiver.device_token;
    const { chat_room_id, date, time, text, order_id } = body;

    let order: OrderEntity = null;
    if (order_id) {
      order = await this.orderService.findOrderById(order_id);
    }
    const chat_id = nanoid(11);
    let chat: Partial<ChatEntity> = {
      id: chat_id,
      date: date,
      time: time,
      text: text,
      order: order,
      sender: sender,
      receiver: receiver,
    };
    let room_id: string;
    if (chat_room_id) {
      try {
        room_id = chat_room_id;
        const room = await this.chatRoomRepo.findOneOrFail(chat_room_id);
        chat = {
          ...chat,
          room: room,
        };
        await this.chatRepo.insert(chat);
      } catch (err) {
        throw new ConflictException(
          new ResponseBody(null, 'chat room has not been created'),
        );
      }
    } else {
      room_id = nanoid(11);
      const room = this.chatRoomRepo.create({
        id: room_id,
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
      let notificationBody: string;
      if (text) {
        notificationBody = text;
      } else if (order_id) {
        notificationBody = `${
          senderRole === 'seller' ? seller.shop_name : sender.full_name
        } mengirim sebuah pesan`;
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
            title: `Pesan dari ${
              senderRole === 'seller' ? seller.shop_name : sender.full_name
            }`,
            body: notificationBody,
            clickAction: 'FLUTTER_NOTIFICATION_CLICK',
          },
        },
        {
          collapseKey: 'Waroenk UMKM',
        },
      );
    }
    return {
      chat_room_id: room_id,
      chat_id: chat_id,
      text: body.text,
      order_id: body.order_id,
      date: body.date,
      time: body.time,
    };
  }

  async getChatRoomsByUserId(userId: string) {
    return this.chatRoomRepo
      .createQueryBuilder('room')
      .innerJoin('room.buyer', 'buyer')
      .innerJoin('room.seller', 'seller')
      .where('buyer.id = :id OR seller.id = :id', { id: userId })
      .select([
        'room.id',
        'buyer.id',
        'buyer.role',
        'buyer.full_name',
        'seller.id',
        'seller.role',
        'seller.full_name',
      ])
      .getMany();
  }

  async getChatsInRoom(roomId: string, userId: string) {
    const res = await this.chatRepo
      .createQueryBuilder('chat')
      .innerJoin('chat.room', 'room')
      .innerJoin('chat.sender', 'sender')
      .innerJoin('chat.receiver', 'receiver')
      .where('room.id = :roomId', { roomId })
      .select([
        'chat.id',
        'room.id',
        'sender.id',
        'sender.full_name',
        'receiver.id',
        'receiver.full_name',
        'chat.text',
        'chat.order.id',
        'chat.date',
        'chat.time'
      ])
      .getMany();
    return res.map(r => ({
      ...r,
      sent_by_me: r.sender.id === userId,
    }));
  }
}
