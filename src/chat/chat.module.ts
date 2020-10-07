import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { UsersModule } from '../users/users.module';
import { ChatService } from './service/chat.service';
import { OrderModule } from '../order/order.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatRoomRepository } from './repositories/chat-room.repository';
import { ChatRepository } from './repositories/chat.repository';
import { ShopModule } from '../shop/shop.module';
import { RoomService } from './service/room.service';
import { ChatProvider } from './providers/chat.provider';

@Module({
  controllers: [ChatController],
  imports: [UsersModule, OrderModule, TypeOrmModule.forFeature([ChatRoomRepository, ChatRepository]), ShopModule],
  exports: [ChatService, ChatProvider],
  providers: [ChatService, RoomService, ChatProvider]
})
export class ChatModule {}
