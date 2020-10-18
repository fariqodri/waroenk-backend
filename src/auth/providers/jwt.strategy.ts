import { ExtractJwt, Strategy } from 'passport-jwt';
import fs from 'fs';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { jwtConstants } from '../constants';
import {
  IS_STAGING_OR_PRODUCTION,
  JWT_RS256_PUBLIC_KEY_PATH,
} from '../../constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: true,
      secretOrKey: IS_STAGING_OR_PRODUCTION
        ? fs.readFileSync(JWT_RS256_PUBLIC_KEY_PATH)
        : jwtConstants.secret,
      algorithms: IS_STAGING_OR_PRODUCTION ? ['RS256'] : ['HS256'],
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
