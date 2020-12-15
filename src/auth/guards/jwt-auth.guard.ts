import { Injectable, ExecutionContext, Inject, BadRequestException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RedisService } from '../../redis/redis.service';
import { ResponseBody } from '../../utils/response';
import { PinoLogger, InjectPinoLogger } from "nestjs-pino"

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {

  constructor(
    @Inject('RedisService') private redisService: RedisService,
    @InjectPinoLogger(JwtAuthGuard.name) private logger: PinoLogger
  ) {
    super()
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      await super.canActivate(context)
    } catch(err) {
      this.logger.error(err)
      throw err
    }
    const request = context.switchToHttp().getRequest()
    const [ _, token ] = request.headers.authorization.split(" ")
    const value = await this.redisService.get(token)
    if (value !== null) throw new BadRequestException(new ResponseBody(null, 'invalid token'))
    return true
  }
}
