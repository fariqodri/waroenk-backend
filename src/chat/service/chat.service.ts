import { Injectable } from '@nestjs/common';
import { nanoid } from 'nanoid';

import { ChatDto } from '../chat.dto';
import { UsersService } from '../../users/services/users.service';
import { ChatRoomRepository } from '../repositories/chat-room.repository';
import { ChatRepository } from '../repositories/chat.repository';
import { OrderEntity } from 'src/order/entities/order.entity';
import { ChatEntity } from '../entities/chat.entity';
import { Connection } from 'typeorm';
import { ShopProvider } from '../../shop/shop.provider';
import { OrderProvider } from '../../order/providers/order.provider';
import { OrderItem } from '../../order/entities/order-item.entity';
import { ChatProvider } from '../providers/chat.provider';
import { ProductEntity } from '../../products/entities/product.entity';

@Injectable()
export class ChatService {
  constructor(
    private readonly orderProvider: OrderProvider,
    private readonly userService: UsersService,
    private readonly chatRepo: ChatRepository,
    private readonly shopProvider: ShopProvider,
    private readonly chatProvider: ChatProvider,
  ) {}

  async chat(body: ChatDto, senderId: string, senderRole: 'seller' | 'buyer') {
    const sender = await this.userService.findUserById(senderId);
    const receiver = await this.userService.findUserById(body.receiver_user_id);
    const seller =
      senderRole === 'seller'
        ? await this.shopProvider.getShopByUserId(sender.id)
        : await this.shopProvider.getShopByUserId(body.receiver_user_id);
    const receiverDeviceToken = receiver.device_token;
    const { date, time, text, order_id } = body;

    let order: OrderEntity = null;
    let productsCount = 0;
    if (order_id) {
      order = await this.orderProvider.findOrderById(order_id, {
        select: ['id', 'fare', 'status'],
      });
      productsCount = await this.orderProvider.countProductsOfOrder(order_id);
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
    const { chat, room } = await this.chatProvider.saveChat(
      baseChat,
      sender,
      receiver,
    );
    const senderName =
      senderRole === 'seller' ? seller.shop_name : sender.full_name;
    let chatData: any, notificationBody: string;
    switch (body.type) {
      case 'text':
        const d1 = await this.chatProvider.prepareTextNotification(chat, room);
        chatData = d1.chatData;
        notificationBody = d1.notificationBody;
        break;
      case 'image':
        const d2 = await this.chatProvider.prepareImageNotification(
          chat,
          room,
          senderRole,
          seller,
          sender,
        );
        chatData = d2.chatData;
        notificationBody = d2.notificationBody;
        break;
      case 'order':
        const d3 = await this.chatProvider.prepareOrderNotification(
          chat,
          room,
          senderRole,
          seller,
          sender,
          order,
          productsCount,
        );
        chatData = d3.chatData;
        notificationBody = d3.notificationBody;
        break;
    }
    this.chatProvider.sendToDevice(
      receiverDeviceToken,
      chatData,
      notificationBody,
      senderName,
    );
    const { sender: _, receiver: __, created_at, ...rest } = chat;
    return {
      ...rest,
      room: {
        id: rest.room.id,
      },
    };
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
        'chat.timestampMillis',
        'chat.read_by_receiver',
        'chat.type',
        'chat.image_url',
      ])
      .addSelect(
        qb =>
          qb
            .from(OrderItem, 'item')
            .where('item.orderId = order.id')
            .select('COUNT(1)'),
        'order_title',
      )
      .addSelect(
        qb => {
          return qb
            .select('SUM(p.price_per_quantity * o.quantity)', 'price')
            .from(OrderItem, 'o')
            .leftJoin(ProductEntity, 'p', 'o.productId = p.id')
            .groupBy('orderId')
        },
        'order_price'
      )
      .execute();
    const result = res.map(r => ({
      id: r.chat_id,
      timestampMillis: r.chat_timestampMillis,
      text: r.chat_text,
      read_by_receiver: Boolean(r.chat_read_by_receiver),
      type: r.chat_type,
      image_url: r.chat_image_url,
      room: {
        id: r.room_id,
      },
      sender: {
        id: r.sender_id,
        full_name: r.sender_full_name,
      },
      receiver: {
        id: r.receiver_id,
        full_name: r.receiver_full_name,
      },
      order:
        r.order_id === null
          ? null
          : {
              id: r.order_id,
              status: r.order_status,
              fare: r.order_fare + parseInt(r.order_price),
              title: `${r.order_title} Produk`,
            },
      sent_by_me: r.sender_id === userId,
    }));
    return result;
  }
}
