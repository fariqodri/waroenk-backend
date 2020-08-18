import { Controller, Post, UseGuards, UsePipes, Body, Req } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolePermissionGuard } from "../auth/guards/role.permission.guard";
import { ValidationPipe } from "../utils/validation.pipe";
import { PostBody } from "./post.dto";
import { Roles } from "../utils/decorators";
import { Request } from "express";
import { PostService } from "./post.service";
import { ResponseBody } from "../utils/response";

@Controller('posts')
export class PostController {
  constructor(private readonly service: PostService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolePermissionGuard)
  @Roles('seller')
  @UsePipes(ValidationPipe)
  async createPost(@Body() body: PostBody, @Req() req: Request) {
    const { userId } = req.user as { userId: string }
    const response = await this.service.createPost(userId, body.title, body.content)
    return new ResponseBody(response)
  }
}
