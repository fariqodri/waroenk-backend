import { Controller, Put, UseGuards, UsePipes, Body, Req, Post, Get, Param, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ValidationPipe } from '../utils/validation.pipe';
import { RegisterDeviceDto, ChatDto } from './chat.dto';
import { Request } from 'express';
import { UsersService } from '../users/services/users.service';
import { ResponseBody } from '../utils/response';
import { ChatService } from './chat.service';

@Controller('chats')
export class ChatController {
  constructor(
    private readonly usersService: UsersService,
    private readonly chatService: ChatService
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
    const res = await this.chatService.chat(body, userId, role)
    return new ResponseBody(res)
  }

  @Get('rooms')
  @UseGuards(JwtAuthGuard)
  async rooms(@Req() request: Request, @Query('with') chatsWith: 'seller' | 'buyer') {
    const { userId, role } = request.user as { userId: string, role: 'seller' | 'buyer' }
    const res = await this.chatService.getChatRoomsByUserId(userId, role, chatsWith)
    return new ResponseBody(res)
  }

  @Get('rooms/seller/:sellerId')
  @UseGuards(JwtAuthGuard)
  async getRoomWithSeller(@Req() request: Request, @Param('sellerId') sellerId: string) {
    const { userId, role } = request.user as { userId: string, role: 'seller' | 'buyer' }
    const res = await this.chatService.getChatsInRoomWithSellerId(userId, sellerId)
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
