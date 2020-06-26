import { Controller, Post, Body, UsePipes, UseGuards, Get, Req } from '@nestjs/common';
import { ValidationPipe } from '../../utils/validation.pipe';
import { RegisterDto } from '../dto/users.dto';
import { UserEntity } from '../entities/users.entity';
import { ResponseBody } from '../../utils/response';
import { UsersService } from '../services/users.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { plainToClass } from 'class-transformer';

@Controller('users')
export class UsersController {

  constructor(
    private userService: UsersService
  ) {}

  @UsePipes(ValidationPipe)
  @Post()
  async register(@Body() body: RegisterDto): Promise<ResponseBody<UserEntity>> {
    return new ResponseBody(await this.userService.register(body))
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findOne(@Req() req: Request): Promise<ResponseBody<UserEntity>> {
    const session: { userId: string } = req.user as { userId: string }
    const result = plainToClass(UserEntity, await this.userService.findOne({ id: session.userId })) 
    return new ResponseBody(result)
  }
}
