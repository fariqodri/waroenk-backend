import {
  Injectable,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { nanoid } from 'nanoid';
import admin from 'firebase-admin';

import { OrderService } from '../../order/services/order.service';
import { ChatDto } from '../chat.dto';
import { UsersService } from '../../users/services/users.service';
import { ChatRoomRepository } from '../repositories/chat-room.repository';
import { ChatRepository } from '../repositories/chat.repository';
import { OrderEntity } from 'src/order/entities/order.entity';
import { ChatEntity } from '../entities/chat.entity';
import { ResponseBody } from '../../utils/response';
import * as serviceAccount from '../service_account.json';
import { FIREBASE_DATABASE_URL } from '../../constants';
import { Connection } from 'typeorm';
import { ChatRoomEntity } from '../entities/chat-room.entity';
import { SellerAttribute } from '../../users/entities/seller.entity';
import { UserEntity } from '../../users/entities/users.entity';
import { ShopProvider } from '../../shop/shop.provider';

@Injectable()
export class ChatService {
  private readonly firebaseApp: admin.app.App;

  constructor(
    private readonly orderService: OrderService,
    private readonly userService: UsersService,
    private readonly chatRoomRepo: ChatRoomRepository,
    private readonly chatRepo: ChatRepository,
    private readonly shopProvider: ShopProvider,
    private readonly connection: Connection,
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
        ? await this.shopProvider.getShopByUserId(sender.id)
        : await this.shopProvider.getShopByUserId(body.receiver_user_id);
    const receiverDeviceToken = receiver.device_token;
    const { chat_room_id, date, time, text, order_id } = body;

    let order: OrderEntity = null;
    if (order_id) {
      order = await this.orderService.findOrderById(order_id);
    }
    const chat_id = nanoid(11);
    const baseChat: Partial<ChatEntity> = {
      id: chat_id,
      date: date,
      time: time,
      text: text,
      order: order,
      sender: sender,
      receiver: receiver,
      type: body.type,
      image_url: body.image_url,
    };
    const { chat, room } = await this.saveChatInDatabase(baseChat, chat_room_id, sender, receiver)
    await this.sendNotification(
      chat,
      body,
      senderRole,
      seller,
      sender,
      order,
      room,
      receiverDeviceToken,
    );
    const { room: room_1, sender: sender_1, receiver: receiver_1, created_at, ...rest } = chat
    return rest;
  }

  async getChatsInRoom(roomId: string, userId: string) {
    await this.chatRepo
      .createQueryBuilder()
      .update()
      .set({ read_by_receiver: true })
      .where(
        'roomId = :roomId AND receiverId = :receiverId AND read_by_receiver = :readByReceiver',
        {
          roomId,
          receiverId: userId,
          readByReceiver: 0,
        },
      )
      .execute();

    const res = await this.chatRepo
      .createQueryBuilder('chat')
      .innerJoin('chat.room', 'room')
      .innerJoin('chat.sender', 'sender')
      .innerJoin('chat.receiver', 'receiver')
      .leftJoin('chat.order', 'order')
      .orderBy('chat.created_at', 'ASC')
      .where('room.id = :roomId', { roomId })
      .select([
        'chat.id',
        'room.id',
        'sender.id',
        'sender.full_name',
        'receiver.id',
        'receiver.full_name',
        'chat.text',
        'order.id',
        'order.status',
        'order.fare',
        'chat.date',
        'chat.time',
        'chat.read_by_receiver',
        'chat.type',
        'chat.image_url',
      ])
      .getMany();
    return res.map(r => ({
      ...r,
      sent_by_me: r.sender.id === userId,
    }));
  }

  private async sendNotification(
    chat: Partial<ChatEntity>,
    requestBody: ChatDto,
    senderRole: 'seller' | 'buyer',
    seller: SellerAttribute,
    sender: UserEntity,
    order: OrderEntity,
    room: ChatRoomEntity,
    deviceToken: string,
  ) {
    if (deviceToken === undefined) {
      return;
    }
    let notificationBody: string;
    let chatData: any = {
      chat_id: chat.id,
      chat_room_id: room.id,
      date: chat.date,
      time: chat.time,
      type: chat.type,
    };
    switch (requestBody.type) {
      case 'text':
        notificationBody = chat.text;
        chatData = {
          ...chatData,
          text: chat.text,
        };
        break;
      case 'image':
        notificationBody = `${
          senderRole === 'seller' ? seller.shop_name : sender.full_name
        } mengirim gambar`;
        chatData = {
          ...chatData,
          image_url: chat.image_url,
        };
      case 'order':
        notificationBody = `${
          senderRole === 'seller' ? seller.shop_name : sender.full_name
        } mengirim detail order`;
        chatData = {
          ...chatData,
          order: JSON.stringify(order),
        };
      default:
        break;
    }
    await this.sendNotificationToDevice(deviceToken, chatData, notificationBody,
      senderRole === 'seller' ? seller.shop_name : sender.full_name)
  }

  async sendNotificationToDevice(deviceToken: string, chatData: any, notificationBody: string, role: string) {
    await this.firebaseApp.messaging().sendToDevice(
      deviceToken,
      {
        data: chatData,
        notification: {
          title: `Pesan dari ${role}`,
          body: notificationBody,
          clickAction: 'FLUTTER_NOTIFICATION_CLICK',
        },
      },
      {
        collapseKey: 'Waroenk UMKM',
      },
    );
  }

  private async saveChatInDatabase(
    baseChat: Partial<ChatEntity>,
    chat_room_id: string,
    sender: UserEntity,
    receiver: UserEntity
  ): Promise<{ chat: ChatEntity, room: ChatRoomEntity }> {
    if (chat_room_id) {
      try {
        const room = await this.chatRoomRepo.findOneOrFail(chat_room_id);
        const chat = this.chatRepo.create({
          ...baseChat,
          room
        })
        await this.connection.transaction(async manager => {
          await manager.insert(ChatEntity, chat);
          await manager.update(ChatRoomEntity, chat_room_id, {
            latest_chat_at: Date.now(),
          });
        });
        return { chat, room }
      } catch (err) {
        throw new ConflictException(
          new ResponseBody(null, 'chat room has not been created'),
        );
      }
    }
    try {
      const room_id = nanoid(11);
      const room = this.chatRoomRepo.create({
        id: room_id,
        buyer: sender,
        seller: receiver
      })
      const chat = this.chatRepo.create({
        ...baseChat,
        room
      })
      await this.connection.transaction(async manager => {
        await manager.insert(ChatRoomEntity, room);
        await manager.insert(ChatEntity, chat);
        await manager.update(ChatRoomEntity, room_id, {
          latest_chat_at: Date.now(),
        });
      });
      return { chat, room }
    } catch (err) {
      throw new BadRequestException(
        new ResponseBody(
          null,
          `chat room already exist for buyer ${sender.id} and seller ${receiver.id}`,
        ),
      );
    }
  }
}
