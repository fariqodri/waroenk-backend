import { Controller, Get, Query, Req, UseGuards, Post, Param, Delete, HttpCode } from "@nestjs/common"
import { AgendaService } from "../services/agenda.service"
import { AgendaQuery } from "../dto/agenda.dto"
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard"
import { RolePermissionGuard } from "../../auth/guards/role.permission.guard"
import { Roles } from "../../utils/decorators"
import { Request } from 'express';

@Controller('agenda')
export class AgendaController {
  constructor(private service: AgendaService) {}

  @Get()
  getAgendas(@Query() {
    limit = 10,
    page = 1,
    title,
    location
  }: AgendaQuery, @Req() request: Request) {
    let userId = ''
    if (request.user) {
      const user: { userId } = request.user as { userId }
      userId = user.userId
    }
    return this.service.listAgenda({
      limit,
      page,
      title,
      location
    })
  }

  @UseGuards(JwtAuthGuard, RolePermissionGuard)
  @Roles('all')
  @Get('myAgenda')
  getMyAgendas(@Query() {
    limit = 10,
    page = 1,
    title,
    location
  }: AgendaQuery, @Req() request: Request) {
    const user: { userId } = request.user as { userId }
    return this.service.listSavedAgenda({
      limit,
      page,
      title,
      location
    }, user.userId)
  }

  @UseGuards(JwtAuthGuard, RolePermissionGuard)
  @Roles('all')
  @Post('myAgenda/:id')
  @HttpCode(201)
  saveAgenda(@Param('id') id: string, @Req() request: Request) {
    const user: { userId } = request.user as { userId }
    return this.service.saveAgenda(id, user.userId)
  }

  @UseGuards(JwtAuthGuard, RolePermissionGuard)
  @Roles('all')
  @Delete('myAgenda/:id')
  @HttpCode(200)
  unsaveAgenda(@Param('id') id: string, @Req() request: Request) {
    const user: { userId } = request.user as { userId }
    return this.service.unsaveAgenda(id, user.userId)
  }
}