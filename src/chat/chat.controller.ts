import { Controller, Put, UseGuards, UsePipes, Body, Req, Get, Param, Query, BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ValidationPipe } from '../utils/validation.pipe';
import { RegisterDeviceDto, ChatDto } from './chat.dto';
import { Request } from 'express';
import { UsersService } from '../users/services/users.service';
import { ResponseBody, ResponseListBody } from '../utils/response';
import { ChatService } from './service/chat.service';
import { RoomService } from './service/room.service';

@Controller('chats')
export class ChatController {
  constructor(
    private readonly usersService: UsersService,
    private readonly chatService: ChatService,
    private readonly roomService: RoomService
  ) {}

  @Put('devices')
  @UseGuards(JwtAuthGuard)
  @UsePipes(ValidationPipe)
  async registerDeviceToken(@Body() body: RegisterDeviceDto, @Req() request: Request) {
    const { userId } = request.user as { userId: string }
    const res = await this.usersService.updateDeviceToken(userId, body.device_token)
    return new ResponseBody(res)
  }

  @Put()
  @UseGuards(JwtAuthGuard)
  @UsePipes(ValidationPipe)
  async chat(@Body() body: ChatDto, @Req() request: Request) {
    const { userId, role } = request.user as { userId: string, role: 'seller' | 'buyer' }
    switch (body.type) {
      case 'text':
        if (body.text === undefined) throw new BadRequestException(new ResponseBody(null, 'chat type is text but text is undefined'))
        break;
      case 'image':
        if (body.image_url === undefined) throw new BadRequestException(new ResponseBody(null, 'chat type is image but image_url is undefined'))
        break;
      case 'order':
        if (body.order_id === undefined) throw new BadRequestException(new ResponseBody(null, 'chat type is order but order_id is undefined'))
        break;
    }
    const res = await this.chatService.chat(body, userId, role)
    return new ResponseBody(res)
  }

  @Get('rooms')
  @UseGuards(JwtAuthGuard)
  async rooms(@Req() request: Request, @Query('with') chatsWith: 'seller' | 'buyer', @Query('page') page: number, @Query('limit') limit: number) {
    const { userId, role } = request.user as { userId: string, role: 'seller' | 'buyer' }
    const res = await this.roomService.getChatRoomsByUserId(userId, role, chatsWith, page, limit)
    return new ResponseListBody(res, 'ok', Number(page) || 1, Number(limit) || 10)
  }

  @Get('rooms/seller/:sellerId')
  @UseGuards(JwtAuthGuard)
  async getRoomWithSeller(@Req() request: Request, @Param('sellerId') sellerId: string) {
    const { userId, role } = request.user as { userId: string, role: 'seller' | 'buyer' }
    const res = await this.roomService.getChatRoomBySellerId(userId, sellerId)
    return new ResponseBody(res)
  }

  @Get('rooms/participant/:participantUserId')
  @UseGuards(JwtAuthGuard)
  async getRoomWithParticipant(@Req() request: Request, @Param('participantUserId') participantId: string) {
    const { userId } = request.user as { userId: string }
    const res = await this.roomService.getChatRoomByParticipantId(userId, participantId)
    return new ResponseBody(res)
  }

  @Get('rooms/:id')
  @UseGuards(JwtAuthGuard)
  async chatsInRoom(@Param('id') roomId: string, @Req() request: Request) {
    const { userId } = request.user as { userId: string, role: 'seller' | 'buyer' }
    const res = await this.chatService.getChatsInRoom(roomId, userId)
    return new ResponseBody(res)
  }
}
