import { Injectable, BadRequestException } from '@nestjs/common';
import { UsersService } from '../../users/services/users.service';
import { JwtService } from '@nestjs/jwt';
import { ResponseBody } from '../../utils/response';
import { RedisService } from '../../redis/redis.service';
import { UserEntity } from '../../users/entities/users.entity';
import * as bcrypt from 'bcrypt'

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private redisService: RedisService
  ) {}

  async login(email: string, password: string) {
    let user: UserEntity
    try {
      user = await this.usersService.findOne({ email });
    } catch (err) {
      throw new BadRequestException(new ResponseBody(null, 'invalid email'))
    }
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (isPasswordValid) {
      const payload = { sub: user.id };
      return {
        access_token: this.jwtService.sign(payload),
      };
    }
    throw new BadRequestException(new ResponseBody(null, 'invalid password'))
  }

  async logout(token: string): Promise<ResponseBody<null>> {
    const payload = this.jwtService.decode(token) as { exp: number, iat: number }
    try {
      await this.redisService.set(token, 1, payload.exp - payload.iat)
      return new ResponseBody(null)
    } catch (err) {
      throw err
    }
  }
}