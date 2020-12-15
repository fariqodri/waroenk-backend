import { Injectable, NotFoundException } from '@nestjs/common';
import { ChatRoomRepository } from '../repositories/chat-room.repository';
import { ChatEntity } from '../entities/chat.entity';
import { ShopProvider } from '../../shop/shop.provider';
import { ResponseBody } from '../../utils/response';
import { ChatRepository } from '../repositories/chat.repository';
import { ChatRoomEntity } from '../entities/chat-room.entity';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

@Injectable()
export class RoomService {
  constructor(
    private readonly chatRoomRepo: ChatRoomRepository,
    private readonly shopProvider: ShopProvider,
    private readonly chatRepo: ChatRepository,
    @InjectPinoLogger(RoomService.name) private logger: PinoLogger
  ) {}

  async getChatRoomsByUserId(
    userId: string,
    role: 'seller' | 'buyer',
    chatsWith: 'seller' | 'buyer',
    page = 1,
    limit = 10
  ) {
    const skippedItems = (page - 1) * limit;
    let query = this.chatRoomRepo
      .createQueryBuilder('room')
      .where('room.participantOneId = :userId OR room.participantTwoId = :userId', { userId })
      .innerJoin('room.participant_one', 'p1')
      .innerJoin('room.participant_two', 'p2')
      .leftJoin('seller', 's1', 'p1.id = s1.userId')
      .leftJoin('seller', 's2', 'p2.id = s2.userId')
      .select([
        'room.id',
        'p1.id',
        'p1.role',
        'p1.full_name',
        'p2.id',
        'p2.role',
        'p2.full_name',
        'room.latest_chat_at',
        's1.shop_name',
        's2.shop_name',
        's1.id',
        's2.id',
        's1.image',
        's2.image'
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
          .select(
            `
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
          `,
          )
          .from(ChatEntity, 'c')
          .where('c.roomId = room.id')
          .innerJoin('c.receiver', 'r')
          .orderBy('c.created_at', 'DESC')
          .limit(1);
      }, 'last_chat')
      .orderBy('room.latest_chat_at', 'DESC')
      .offset(skippedItems)
      .limit(limit);
    const res = await query.getRawMany();
    this.logger.info('Query: %o', query.getQueryAndParameters())
    this.logger.info('Retrieved rooms: %o', res)
    return res
      .map(v => ({
        id: v.room_id,
        participant_one: {
          id: v.p1_id,
          full_name: v.s1_shop_name || v.p1_full_name,
          role: v.p1_role,
          seller_id: v.s1_id,
          image: v.s1_image
        },
        participant_two: {
          id: v.p2_id,
          full_name: v.s2_shop_name || v.p2_full_name,
          role: v.p2_role,
          seller_id: v.s2_id,
          image: v.s2_image
        },
        last_chat: v.last_chat,
        unread_chats: parseInt(v.unread_chats),
        latest_chat_at: parseInt(v.room_latest_chat_at),
      }))
      .filter(v => {
        if (chatsWith != 'buyer' && chatsWith != 'seller') return true
        if (v.participant_one.id == userId) {
          return v.participant_two.role == chatsWith;
        } else if (v.participant_two.id == userId) {
          return v.participant_one.role == chatsWith;
        }
      });
  }

  async getChatRoomBySellerId(
    userId: string,
    sellerId: string,
  ): Promise<ChatRoomEntity> {
    try {
      const seller = await this.shopProvider.getShopById(sellerId);
      const sellerUser = seller.user;
      const resp = await this.chatRoomRepo.findOneOrFail({
        where: {
          participant_one: {
            id: userId,
          },
          participant_two: {
            id: sellerUser.id,
          },
        },
        select: ['id'],
      });
      return resp;
    } catch (err) {
      throw new NotFoundException(
        new ResponseBody(null, 'seller or chat room not found'),
      );
    }
  }

  async getChatRoomByParticipantId(
    userId: string,
    participantId: string,
  ): Promise<ChatRoomEntity> {
    try {
      const resp = await this.chatRoomRepo.findOneOrFail({
        where: [
          {
            participant_one: { id: userId },
            participant_two: { id: participantId },
          },
          {
            participant_one: { id: participantId },
            participant_two: { id: userId },
          },
        ],
        select: ['id'],
      });
      return resp;
    } catch (err) {
      throw new NotFoundException(
        new ResponseBody(null, 'chat room not found'),
      );
    }
  }
}
