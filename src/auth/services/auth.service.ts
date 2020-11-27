import { Injectable, BadRequestException, ImATeapotException } from '@nestjs/common';
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

  /**
   * 
   * @param email 
   * @param password 
   * @param client "web" or "app" 
   * 1. Find user by email. If not found, return error response 400 invalid email or password
   * 2. Check if account is locked by getting value of "keyLocked" from Redis. If locked, return error response 418
   * 3. Check if user is active. If not active, return error response 400
   * 4. Check if inserted password is correct. If not correct, do the login attempt increment/account lock mechanism
   */
  async login(email: string, password: string, client: string) {
    let user: UserEntity
    let userPassword: string
    try {
      user = await this.usersService.findOne({ email });
      userPassword = await this.usersService.getUserPassword(user.id)
    } catch (err) {
      throw new BadRequestException(new ResponseBody(null, 'invalid email or password'))
    }
    const accountLockedRedisKey = `${user.email}~account_locked`
    const isAccountLocked = await this.redisService.get(accountLockedRedisKey, false)
    if (isAccountLocked === true) {
      throw new ImATeapotException(new ResponseBody(null, 'temporary account lock'))
    }
    if (!user.is_active) {
      throw new BadRequestException(new ResponseBody(null, 'user is not active yet'))
    }
    const isPasswordValid = await bcrypt.compare(password, userPassword)
    const loginAttemptsRedisKey = `${user.email}~login_attempts`
    if (isPasswordValid) {
      const payload = { sub: user.id, role: user.role };
      await this.redisService.set(loginAttemptsRedisKey, 0, 10)
      return new ResponseBody({
        access_token: this.jwtService.sign(payload, client === 'web' ? { expiresIn: '7d' } : {}),
      });
    } else {
      const loginAttempts = await this.redisService.get(loginAttemptsRedisKey, 0)
      if (loginAttempts + 1 < 5) {
        await this.redisService.set(loginAttemptsRedisKey, loginAttempts + 1, 10)
      } else {
        await this.redisService.set(accountLockedRedisKey, true, 180)
        await this.redisService.set(loginAttemptsRedisKey, 0, 10)
        throw new ImATeapotException(new ResponseBody(null, 'temporary account lock'))
      }
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