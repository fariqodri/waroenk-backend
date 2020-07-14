import { Controller, Req, HttpCode, Body, Post, UsePipes } from '@nestjs/common';
import { Request } from 'express';
import { ValidationPipe } from '../../utils/validation.pipe';
import { DiscussionService } from '../services/discussion.service';
import { DiscussionPostParam } from '../dto/discussion.dto';

@Controller('discussion')
export class DiscussionController {
  constructor(private service: DiscussionService) {}

  @UsePipes(ValidationPipe)
  @Post('')
  @HttpCode(201)
  async createProduct(@Body() param: DiscussionPostParam, @Req() request: Request) {
    const user: { userId } = request.user as { userId }
    return this.service.createDiscussion(user.userId, param);
  }
}