import { Controller, Get, Post, UseGuards, Req, HttpCode, Body, UsePipes } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { Request } from 'express';
import { ValidationPipe } from '../../utils/validation.pipe';
import { LoginDto } from '../dto/auth.dto';

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @UsePipes(ValidationPipe)
  @Post('login')
  @HttpCode(200)
  async login(@Body() body: LoginDto) {
    return this.authService.login(body.email, body.password);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Post("logout")
  @HttpCode(200)
  logout(@Req() req: Request) {
    const [_, token] = req.headers.authorization.split(" ")
    const session: { userId: string, expiredAt: number, issuedAt: number } = req.user as { userId: string, expiredAt: number, issuedAt: number }
    return this.authService.logout(token, session.expiredAt, session.issuedAt)
  }
}
