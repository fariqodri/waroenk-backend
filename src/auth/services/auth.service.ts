import { Injectable, BadRequestException } from '@nestjs/common';
import { UsersService } from '../../users/services/users.service';
import { JwtService } from '@nestjs/jwt';
import { ResponseBody } from '../../utils/response';
import { RedisService } from '../../redis/redis.service';
import { UserEntity } from '../../users/entities/users.entity';
import * as bcrypt from 'bcrypt'
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private redisService: RedisService,
    private readonly mailerService: MailerService
  ) {}

  async sendMail(param: string) {
    this
      .mailerService
      .sendMail({
        to: 'kemask69@gmail.com',
        from: 'mail@bukawaroenk.co.id',
        subject: 'Testing Nest MailerModule ✔',
        text: 'welcome',
        html: `<b>${param}</b>`,
      })
      .then((success) => {
        console.log(success)
      })
      .catch((err) => {
        console.log(err)
      });
    return new ResponseBody(null)
  }

  async login(email: string, password: string) {
    let user: UserEntity
    let userPassword: string
    try {
      user = await this.usersService.findOne({ email });
      userPassword = await this.usersService.getUserPassword(user.id)
    } catch (err) {
      throw new BadRequestException(new ResponseBody(null, 'invalid email'))
    }
    const isPasswordValid = await bcrypt.compare(password, userPassword)
    if (isPasswordValid) {
      const payload = { sub: user.id, role: user.role };
      return new ResponseBody({
        access_token: this.jwtService.sign(payload),
      });
    }
    throw new BadRequestException(new ResponseBody(null, 'invalid password'))
  }

  async logout(token: string, expiredAt: number, issuedAt: number): Promise<ResponseBody<null>> {
    try {
      await this.redisService.set(token, 1, expiredAt - issuedAt)
      return new ResponseBody(null)
    } catch (err) {
      throw err
    }
  }
}