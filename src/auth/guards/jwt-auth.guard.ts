import { Injectable, ExecutionContext, Inject, BadRequestException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { RedisService } from '../../redis/redis.service';
import { ResponseBody } from '../../utils/response';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {

  constructor(@Inject('RedisService') private redisService: RedisService) {
    super()
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      await super.canActivate(context)
    } catch(err) {
      throw err
    }
    const request = context.switchToHttp().getRequest()
    const [ _, token ] = request.headers.authorization.split(" ")
    const value = await this.redisService.get(token)
    if (value !== null) throw new BadRequestException(new ResponseBody(null, 'invalid token'))
    return true
  }
}
