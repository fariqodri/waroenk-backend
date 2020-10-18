import { Module, Global } from '@nestjs/common';
import * as fs from 'fs';
import { AuthService } from './services/auth.service';
import { JwtStrategy } from './providers/jwt.strategy';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { AuthController } from './controllers/auth.controller';
import {
  IS_STAGING_OR_PRODUCTION,
  JWT_RS256_PRIVATE_KEY_PATH,
} from '../constants';

@Global()
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: jwtConstants.secret,
      privateKey: IS_STAGING_OR_PRODUCTION ? fs.readFileSync(JWT_RS256_PRIVATE_KEY_PATH) : undefined,
      signOptions: {
        algorithm: IS_STAGING_OR_PRODUCTION ? 'RS256' : 'HS256',
      },
    }),
    UsersModule,
  ],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
