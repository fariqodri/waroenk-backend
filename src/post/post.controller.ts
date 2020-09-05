import { Controller, Post, UseGuards, UsePipes, Body, Req, Get, Query, Param, Delete } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolePermissionGuard } from "../auth/guards/role.permission.guard";
import { ValidationPipe } from "../utils/validation.pipe";
import { PostBody, GetPostQuery } from "./post.dto";
import { Roles } from "../utils/decorators";
import { Request } from "express";
import { PostService } from "./post.service";
import { ResponseBody, ResponseListWithCountBody } from "../utils/response";

@Controller('posts')
export class PostController {
  constructor(private readonly service: PostService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolePermissionGuard)
  @Roles('seller')
  @UsePipes(ValidationPipe)
  async createPost(@Body() body: PostBody, @Req() req: Request) {
    const { userId } = req.user as { userId: string }
    const response = await this.service.createPost(userId, body.title, body.content, body.image)
    return new ResponseBody(response)
  }

  @Get('seller/:sellerId')
  async getPosts(@Query() {
    page = 1,
    limit = 10,
    sort = 'latest'
  }: GetPostQuery, @Req() req: Request, @Param('sellerId') sellerId: string) {
    const { result, total } = await this.service.getPosts({
      page,
      limit,
      sort
    }, sellerId)
    return new ResponseListWithCountBody(result, 'ok', parseInt(page.toString()), parseInt(limit.toString()), total)
  }
}
