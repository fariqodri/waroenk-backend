import { Controller, Get, Post, UseGuards, Req, HttpCode, Body } from '@nestjs/common';
import { LocalAuthGuard } from './local-auth.guard';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Request } from 'express';

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Req() req, @Body() body) {
    return this.authService.login(body);
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
    return this.authService.logout(token)
  }
}
