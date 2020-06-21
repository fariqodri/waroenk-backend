import { Controller, Post, Body, UsePipes } from '@nestjs/common';
import { ValidationPipe } from '../utils/validation.pipe';
import { RegisterDto } from './users.dto';
import { UserEntity } from './users.entity';
import { ResponseBody } from '../utils/response';
import { UsersService } from './users.service';

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
}
