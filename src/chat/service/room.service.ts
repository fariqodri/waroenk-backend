import { Injectable, NotFoundException } from "@nestjs/common";
import { ChatRoomRepository } from "../repositories/chat-room.repository";
import { ChatEntity } from "../entities/chat.entity";
import { ShopProvider } from "../../shop/shop.provider";
import { ResponseBody } from "../../utils/response";
import { ChatRepository } from "../repositories/chat.repository";
import { ChatRoomEntity } from "../entities/chat-room.entity";

@Injectable()
export class RoomService {
  constructor(
    private readonly chatRoomRepo: ChatRoomRepository,
    private readonly shopProvider: ShopProvider,
    private readonly chatRepo: ChatRepository
  ) {}

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
      .addSelect(subQuery => {
        return subQuery
          .select(`
            CASE
              WHEN c.type = 'text' THEN 
                CASE 
                  WHEN r.id = '${userId}' THEN CONCAT("Anda menerima pesan: ", c.text)
                  ELSE CONCAT("Anda mengirim pesan: ", c.text)
                END
              WHEN c.type = 'image' THEN 
                CASE 
                  WHEN r.id = '${userId}' THEN 'Anda menerima sebuah gambar'
                  ELSE 'Anda mengirim sebuah gambar' 
                END
              WHEN c.type = 'order' THEN
                CASE 
                  WHEN r.id = '${userId}' THEN 'Anda menerima sebuah detail order'
                  ELSE 'Anda mengirim sebuah detail order' 
                END
            END AS last_chat
          `)
          .from(ChatEntity, 'c')
          .where(
            'c.roomId = room.id'
          )
          .innerJoin('c.receiver', 'r')
          .orderBy('c.created_at', 'DESC')
          .limit(1)
      }, 'last_chat')
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
      last_chat: v.last_chat,
      unread_chats: parseInt(v.unread_chats),
      latest_chat_at: parseInt(v.room_latest_chat_at)
    }))
  }

  async getChatRoomBySellerId(userId: string, sellerId: string): Promise<ChatRoomEntity> {
    try {
      const seller = await this.shopProvider.getShopById(sellerId)
      const sellerUser = seller.user
      return this.chatRoomRepo.findOneOrFail({
        where: {
          buyer: {
            id: userId
          },
          seller: {
            id: sellerUser.id
          }
        },
        select: ['id']
      })
    } catch(err) {
      throw new NotFoundException(new ResponseBody(null, 'seller or chat room not found'))
    }
  }
}