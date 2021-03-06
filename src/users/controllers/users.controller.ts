import { Controller, Post, Body, UsePipes, UseGuards, Get, Req, Put, HttpCode } from '@nestjs/common';
import { ValidationPipe } from '../../utils/validation.pipe';
import { RegisterDto, editProfileParam, ShippingAddressDto, RequestOtpParam, ResetPasswordParam, UserActivationParam } from '../dto/users.dto';
import { UserEntity } from '../entities/users.entity';
import { ResponseBody } from '../../utils/response';
import { UsersService } from '../services/users.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Request } from 'express';

@Controller('users')
export class UsersController {

  constructor(
    private userService: UsersService
  ) {}

  @UsePipes(ValidationPipe)
  @UseGuards(JwtAuthGuard)
  @Put()
  @HttpCode(201)
  async update(@Body() body: editProfileParam, @Req() req: Request) {
    const session: { userId: string } = req.user as { userId: string }
    return this.userService.editProfile(body, session.userId)
  }

  @UsePipes(ValidationPipe)
  @Post()
  async register(@Body() body: RegisterDto): Promise<ResponseBody<UserEntity>> {
    return new ResponseBody(await this.userService.register(body))
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findOne(@Req() req: Request) {
    const session: { userId: string } = req.user as { userId: string }
    const response = await this.userService.findOne({ id: session.userId })
    return new ResponseBody(response)
  }

  @UseGuards(JwtAuthGuard)
  @UsePipes(ValidationPipe)
  @Put('shipping-address')
  async upsertShippingAddress(@Req() req: Request, @Body() body: ShippingAddressDto) {
    const session: { userId: string } = req.user as { userId: string }
    const response = await this.userService.upsertShippingAddress(session.userId, body)
    return new ResponseBody(response)
  }

  @UseGuards(JwtAuthGuard)
  @Get('shipping-address')
  async getShippingAddress(@Req() req: Request) {
    const session: { userId: string } = req.user as { userId: string }
    const response = await this.userService.getShippingAddress(session.userId)
    return new ResponseBody(response)
  }

  @UsePipes(ValidationPipe)
  @Post('request-otp')
  async requestOtp(@Body() param: RequestOtpParam) {
    return this.userService.requestOtp(param)
  }

  @UsePipes(ValidationPipe)
  @Post('reset-password')
  async resetPassword(@Body() param: ResetPasswordParam) {
    return this.userService.resetPassword(param)
  }

  @UsePipes(ValidationPipe)
  @Post('activation')
  async activateUser(@Body() param: UserActivationParam) {
    return this.userService.activateUser(param);
  }
}
