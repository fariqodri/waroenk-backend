import { Injectable, ExecutionContext, Inject, BadRequestException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RedisService } from '../../redis/redis.service';
import { ResponseBody } from '../../utils/response';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {

  constructor(@Inject('RedisService') private redisService: RedisService) {
    super()
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const authHeader = request.headers.authorization
    if (!authHeader) {
      return true
    }
    try {
      await super.canActivate(context)
    } catch(err) {
      throw err
    }
    const [ _, token ] = authHeader.split(" ")
    const value = await this.redisService.get(token)
    if (value !== null) throw new BadRequestException(new ResponseBody(null, 'invalid token'))
    return true
  }
}
