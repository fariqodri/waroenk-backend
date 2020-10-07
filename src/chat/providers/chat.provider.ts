import { Injectable } from '@nestjs/common';
import admin from 'firebase-admin';
import { Connection } from 'typeorm';

import { FIREBASE_DATABASE_URL } from '../../constants';
import { ChatEntity } from '../entities/chat.entity';
import * as serviceAccount from '../service_account.json';
import { UserEntity } from '../../users/entities/users.entity';
import { ChatRoomRepository } from '../repositories/chat-room.repository';
import { ChatRepository } from '../repositories/chat.repository';
import { ChatRoomEntity } from '../entities/chat-room.entity';
import { nanoid } from 'nanoid';
import { SellerAttribute } from '../../users/entities/seller.entity';
import { OrderEntity } from '../../order/entities/order.entity';

@Injectable()
export class ChatProvider {
  private readonly firebaseApp: admin.app.App;

  constructor(
    private readonly chatRoomRepo: ChatRoomRepository,
    private readonly chatRepo: ChatRepository,
    private readonly connection: Connection,
  ) {
    this.firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
      databaseURL: FIREBASE_DATABASE_URL,
    });
  }

  public async sendToDevice(
    deviceToken: string,
    chatData: any,
    notificationBody: string,
    senderName: string,
  ) {
    if (!deviceToken) return;
    await this.firebaseApp.messaging().sendToDevice(
      deviceToken,
      {
        data: chatData,
        notification: {
          title: `Pesan dari ${senderName}`,
          body: notificationBody,
          clickAction: 'FLUTTER_NOTIFICATION_CLICK',
        },
      },
      {
        collapseKey: 'Waroenk UMKM',
      },
    );
  }

  public async saveChat(
    baseChat: Partial<ChatEntity>,
    sender: UserEntity,
    receiver: UserEntity,
  ): Promise<{ chat: ChatEntity; room: ChatRoomEntity }> {
    const room = await this.chatRoomRepo.findOne({
      where: [
        {
          buyer: sender,
          seller: receiver,
        },
        {
          buyer: receiver,
          seller: sender,
        },
      ],
    });
    if (room) {
      return this.appendChatToRoom(baseChat, room);
    }
    return this.createNewRoom(baseChat, sender, receiver);
  }

  private async appendChatToRoom(
    baseChat: Partial<ChatEntity>,
    room: ChatRoomEntity,
  ) {
    const chat = this.chatRepo.create({
      ...baseChat,
      room: room,
    });
    await this.connection.transaction(async manager => {
      await manager.insert(ChatEntity, chat);
      await manager.update(ChatRoomEntity, room.id, {
        latest_chat_at: Date.now(),
      });
    });
    return { chat, room };
  }

  private async createNewRoom(
    baseChat: Partial<ChatEntity>,
    sender: UserEntity,
    receiver: UserEntity,
  ) {
    const room = this.chatRoomRepo.create({
      id: nanoid(11),
      buyer: sender,
      seller: receiver,
    });
    const chat = this.chatRepo.create({
      ...baseChat,
      room: room,
    });
    await this.connection.transaction(async manager => {
      await manager.insert(ChatRoomEntity, room);
      await manager.insert(ChatEntity, chat);
      await manager.update(ChatRoomEntity, room.id, {
        latest_chat_at: Date.now(),
      });
    });
    return { chat, room };
  }

  public async prepareTextNotification(chat: ChatEntity, room: ChatRoomEntity) {
    const notificationBody: string = chat.text;
    const chatData: any = {
      chat_id: chat.id,
      chat_room_id: room.id,
      date: chat.date,
      time: chat.time,
      type: chat.type,
      text: chat.text,
    };
    return { chatData, notificationBody };
  }

  public async prepareImageNotification(
    chat: ChatEntity,
    room: ChatRoomEntity,
    senderRole: 'seller' | 'buyer',
    seller: SellerAttribute,
    sender: UserEntity,
  ) {
    const notificationBody: string = `${
      senderRole === 'seller' ? seller.shop_name : sender.full_name
    } mengirim gambar`;
    const chatData: any = {
      chat_id: chat.id,
      chat_room_id: room.id,
      date: chat.date,
      time: chat.time,
      type: chat.type,
      image_url: chat.image_url,
    };
    return { chatData, notificationBody };
  }

  public async prepareOrderNotification(
    chat: ChatEntity,
    room: ChatRoomEntity,
    senderRole: 'seller' | 'buyer',
    seller: SellerAttribute,
    sender: UserEntity,
    order: OrderEntity,
    productsCount: number,
  ) {
    const notificationBody = `${
      senderRole === 'seller' ? seller.shop_name : sender.full_name
    } mengirim detail order`;
    const chatData: any = {
      chat_id: chat.id,
      chat_room_id: room.id,
      date: chat.date,
      time: chat.time,
      type: chat.type,
      title: `${productsCount} Produk`,
      order: JSON.stringify(order),
    };
    return { chatData, notificationBody };
  }
}
