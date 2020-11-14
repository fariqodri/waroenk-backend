import { ExtractJwt, Strategy } from 'passport-jwt';
import * as fs from 'fs';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { jwtConstants } from '../constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtConstants.secret,
    });
  }

  validate(payload: any) {
    return {
      userId: payload.sub,
      expiredAt: payload.exp,
      issuedAt: payload.iat,
      role: payload.role,
    };
  }
}
