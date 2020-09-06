import { Controller, Req, HttpCode, Body, Post, UsePipes, UseGuards, Get, Param, Query } from '@nestjs/common';
import { Request } from 'express';
import { ValidationPipe } from '../../utils/validation.pipe';
import { DiscussionService } from '../services/discussion.service';
import { DiscussionPostParam, ListDiscussionParam } from '../dto/discussion.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolePermissionGuard } from '../../auth/guards/role.permission.guard';

@Controller('discussion')
export class DiscussionController {
  constructor(private service: DiscussionService) {}

  @UseGuards(JwtAuthGuard, RolePermissionGuard)
  @UsePipes(ValidationPipe)
  @Post()
  @HttpCode(201)
  async createDiscussion(@Body() param: DiscussionPostParam, @Req() request: Request) {
    const user: { userId } = request.user as { userId }
    return this.service.createDiscussion(user.userId, param);
  }

  @Get('product/:productId')
  getDiscussions(@Param('productId') productId: string, @Query() param: ListDiscussionParam) {
    return this.service.getDiscussion(productId, param)
  }
}