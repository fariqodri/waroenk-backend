import { Controller, Get, Post, UseGuards, Req, HttpCode, Body } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { Request } from 'express';

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { email: string, password: string }) {
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
    return this.authService.logout(token)
  }
}
