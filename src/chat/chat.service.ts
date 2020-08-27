import {
  Injectable,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
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
import { Connection } from 'typeorm';
import { ChatRoomEntity } from './entities/chat-room.entity';

@Injectable()
export class ChatService {
  private readonly firebaseApp: admin.app.App;

  constructor(
    private readonly orderService: OrderService,
    private readonly userService: UsersService,
    private readonly chatRoomRepo: ChatRoomRepository,
    private readonly chatRepo: ChatRepository,
    private readonly shopService: ShopService,
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
        await this.connection.transaction(async manager => {
          await manager.insert(ChatEntity, chat);
          await manager.update(ChatRoomEntity, chat_room_id, {
            latest_chat_at: Date.now(),
          });
        });
      } catch (err) {
        throw new ConflictException(
          new ResponseBody(null, 'chat room has not been created'),
        );
      }
    } else {
      room_id = nanoid(11);
      try {
        await this.connection.transaction(async manager => {
          const room = manager.create(ChatRoomEntity, {
            id: room_id,
            buyer: sender,
            seller: receiver,
          });
          await manager.insert(ChatRoomEntity, room);
          chat = {
            ...chat,
            room: room,
          };
          await manager.insert(ChatEntity, chat);
          await manager.update(ChatRoomEntity, room_id, {
            latest_chat_at: Date.now(),
          });
        });
      } catch (err) {
        throw new BadRequestException(
          new ResponseBody(
            null,
            `chat room already exist for buyer ${senderId} and seller ${receiver.id}`,
          ),
        );
      }
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

  async getChatRoomsByUserId(
    userId: string,
    role: 'seller' | 'buyer',
    chatsWith: 'seller' | 'buyer',
  ) {
    let query = this.chatRoomRepo
      .createQueryBuilder('room')
      .innerJoin('room.buyer', 'buyer')
      .innerJoin('room.seller', 'seller')
      .select([
        'room.id',
        'buyer.id',
        'buyer.role',
        'buyer.full_name',
        'seller.id',
        'seller.role',
        'seller.full_name',
        'room.latest_chat_at'
      ])
      .addSelect(
        subQuery =>
          subQuery
            .select('COUNT(1)')
            .from(ChatEntity, 'chats')
            .where(
              'chats.roomId = room.id AND chats.read_by_receiver = 0 AND chats.receiverId = :receiverId',
              { receiverId: userId },
            ),
        'unread_chats',
      )
      .orderBy('room.latest_chat_at', 'DESC');
    if (role === 'seller') {
      switch (chatsWith) {
        case 'buyer':
          query = query.where('buyer.role = :role AND seller.id = :id', {
            role: 'buyer',
            id: userId,
          });
          break;
        case 'seller':
          query = query.where('buyer.id = :id', { id: userId });
          break;
        default:
          break;
      }
    } else if (role === 'buyer') {
      query = query.where('buyer.id = :id', { id: userId });
    }
    const res = await query.getRawMany()
    return res.map(v => ({
      id: v.room_id,
      buyer: {
        id: v.buyer_id,
        full_name: v.buyer_full_name,
        role: v.buyer_role
      },
      seller: {
        id: v.seller_id,
        full_name: v.seller_full_name,
        role: v.seller_role
      },
      unread_chats: parseInt(v.unread_chats),
      latest_chat_at: parseInt(v.room_latest_chat_at)
    }))
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
        'chat.image_url'
      ])
      .getMany();
    return res.map(r => ({
      ...r,
      sent_by_me: r.sender.id === userId,
    }));
  }

  async getChatsInRoomWithSellerId(userId: string, sellerId: string) {
    let room: ChatRoomEntity
    try {
      room = await this.chatRoomRepo.findOneOrFail({
        where: {
          buyer: {
            id: userId,
          },
          seller: {
            id: sellerId,
          },
        },
      });
    } catch {
      throw new NotFoundException(
        new ResponseBody(
          null,
          `chat room with buyer ${userId} and seller ${sellerId} not found`,
        ),
      );
    }
    await this.chatRepo
      .createQueryBuilder()
      .update()
      .set({ read_by_receiver: true })
      .where(
        'roomId = :roomId AND receiverId = :receiverId AND read_by_receiver = :readByReceiver',
        {
          roomId: room.id,
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
      .where('room.id = :roomId', { roomId: room.id })
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
        'chat.image_url'
      ])
      .getMany();
    return res.map(r => ({
      ...r,
      sent_by_me: r.sender.id === userId,
    }));
  }
}
