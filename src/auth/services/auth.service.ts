import { Injectable, BadRequestException, ImATeapotException, Logger } from '@nestjs/common';
import { UsersService } from '../../users/services/users.service';
import { JwtService } from '@nestjs/jwt';
import { ResponseBody } from '../../utils/response';
import { RedisService } from '../../redis/redis.service';
import { UserEntity } from '../../users/entities/users.entity';
import * as bcrypt from 'bcrypt'
import { PinoLogger, InjectPinoLogger } from "nestjs-pino";

@Injectable()
export class AuthService {
  // private readonly logger = new Logger(AuthService.name)
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private redisService: RedisService,
    @InjectPinoLogger(AuthService.name) private logger: PinoLogger
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
      this.logger.info(`User %o not found`, {email: email})
      throw new BadRequestException(new ResponseBody(null, 'invalid email or password'))
    }
    const accountLockedRedisKey = `${user.email}~account_locked`
    const isAccountLocked = await this.redisService.get(accountLockedRedisKey, false)
    if (isAccountLocked === true) {
      this.logger.info(`User %o still locked`, {id: user.id, email: email})
      throw new ImATeapotException(new ResponseBody(null, 'temporary account lock'))
    }
    if (!user.is_active) {
      this.logger.info(`User %o is not active`, {id: user.id, email: email})
      throw new BadRequestException(new ResponseBody(null, 'user is not active yet'))
    }
    const isPasswordValid = await bcrypt.compare(password, userPassword)
    const loginAttemptsRedisKey = `${user.email}~login_attempts`
    if (isPasswordValid) {
      const payload = { sub: user.id, role: user.role };
      await this.redisService.set(loginAttemptsRedisKey, 0, 10)
      this.logger.info(`User %o logged in with client ${client}`, {id: user.id, email: email})
      return new ResponseBody({
        access_token: this.jwtService.sign(payload, client === 'web' ? { expiresIn: '7d' } : {}),
      });
    } else {
      const loginAttempts = await this.redisService.get(loginAttemptsRedisKey, 0)
      if (loginAttempts + 1 < 5) {
        this.logger.info(`User %o locked for 180 seconds`, {id: user.id, email: email})
        await this.redisService.set(loginAttemptsRedisKey, loginAttempts + 1, 10)
      } else {
        await this.redisService.set(accountLockedRedisKey, true, 180)
        await this.redisService.set(loginAttemptsRedisKey, 0, 10)
        throw new ImATeapotException(new ResponseBody(null, 'temporary account lock'))
      }
    }
    throw new BadRequestException(new ResponseBody(null, 'invalid email or password'))
  }

  async logout(token: string, session: { userId: string, expiredAt: number, issuedAt: number }): Promise<ResponseBody<null>> {
    try {
      const duration = session.expiredAt - session.issuedAt
      this.logger.info(`Session %o`, session)
      if (isNaN(duration)) {
        this.logger.info(`token inactivated forever`)
        await this.redisService.set(token, 1)
      } else {
        this.logger.info(`token inactivated for ${duration} seconds`)
        await this.redisService.set(token, 1, duration)
      }
      return new ResponseBody(null)
    } catch (err) {
      throw err
    }
  }
}