import { Controller, Post, Body, UsePipes } from '@nestjs/common';
import { ValidationPipe } from '../../utils/validation.pipe';
import { RegisterDto } from '../dto/users.dto';
import { UserEntity } from '../entities/users.entity';
import { ResponseBody } from '../../utils/response';
import { UsersService } from '../services/users.service';

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
