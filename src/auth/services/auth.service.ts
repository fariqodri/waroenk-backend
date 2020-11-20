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

  async login(email: string, password: string, client: string) {
    let user: UserEntity
    let userPassword: string
    try {
      user = await this.usersService.findOne({ email });
      userPassword = await this.usersService.getUserPassword(user.id)
    } catch (err) {
      throw new BadRequestException(new ResponseBody(null, 'invalid email or password'))
    }
    if (!user.is_active) {
      throw new BadRequestException(new ResponseBody(null, 'user is not active yet'))
    }
    const isPasswordValid = await bcrypt.compare(password, userPassword)
    if (isPasswordValid) {
      const payload = { sub: user.id, role: user.role };
      return new ResponseBody({
        access_token: this.jwtService.sign(payload, client === 'web' ? { expiresIn: '7d' } : {}),
      });
    }
    throw new BadRequestException(new ResponseBody(null, 'invalid email or password'))
  }

  async logout(token: string, expiredAt: number, issuedAt: number): Promise<ResponseBody<null>> {
    try {
      const duration = expiredAt - issuedAt
      if (isNaN(duration)) {
        await this.redisService.set(token, 1)
      } else {
        await this.redisService.set(token, 1, duration)
      }
      return new ResponseBody(null)
    } catch (err) {
      throw err
    }
  }
}