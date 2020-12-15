import { ExtractJwt, Strategy } from 'passport-jwt';
import * as fs from 'fs';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { jwtConstants } from '../constants';
import { PinoLogger, InjectPinoLogger } from "nestjs-pino";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectPinoLogger(JwtStrategy.name) private logger: PinoLogger
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtConstants.secret,
    });
  }

  validate(payload: any) {
    const res = {
      userId: payload.sub,
      expiredAt: payload.exp,
      issuedAt: payload.iat,
      role: payload.role,
    }
    this.logger.info(res)
    return res;
  }
}
