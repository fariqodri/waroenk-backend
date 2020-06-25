import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/services/users.service';
import { JwtService } from '@nestjs/jwt';
import { ResponseBody } from '../utils/response';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private redisService: RedisService
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(username);
    if (user && user.password === pass) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.userId };
    return {
      access_token: this.jwtService.sign(payload),
    };
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