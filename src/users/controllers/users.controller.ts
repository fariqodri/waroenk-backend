import { Controller, Post, Body, UsePipes, UseGuards, Get, Req, Put, HttpCode } from '@nestjs/common';
import { ValidationPipe } from '../../utils/validation.pipe';
import { RegisterDto, editProfileParam } from '../dto/users.dto';
import { UserEntity } from '../entities/users.entity';
import { ResponseBody } from '../../utils/response';
import { UsersService } from '../services/users.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Request } from 'express';

@Controller('users')
export class UsersController {

  constructor(
    private userService: UsersService
  ) {}

  @UsePipes(ValidationPipe)
  @UseGuards(JwtAuthGuard)
  @Put()
  @HttpCode(201)
  async update(@Body() body: editProfileParam, @Req() req: Request) {
    const session: { userId: string } = req.user as { userId: string }
    return this.userService.editProfile(body, session.userId)
  }

  @UsePipes(ValidationPipe)
  @Post()
  async register(@Body() body: RegisterDto): Promise<ResponseBody<UserEntity>> {
    return new ResponseBody(await this.userService.register(body))
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findOne(@Req() req: Request) {
    const session: { userId: string } = req.user as { userId: string }
    const response = await this.userService.findOne({ id: session.userId })
    return new ResponseBody(response)
  }
}
