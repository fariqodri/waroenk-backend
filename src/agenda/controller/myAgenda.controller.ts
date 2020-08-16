import { Controller, Get, Query, Req, UseGuards, Post, Param, Delete, HttpCode } from "@nestjs/common"
import { AgendaService } from "../services/agenda.service"
import { AgendaQuery } from "../dto/agenda.dto"
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard"
import { RolePermissionGuard } from "../../auth/guards/role.permission.guard"
import { Roles } from "../../utils/decorators"
import { Request } from 'express';

@Controller('myAgenda')
export class MyAgendaController {
  constructor(private service: AgendaService) {}

  @UseGuards(JwtAuthGuard, RolePermissionGuard)
  @Roles('all')
  @Get()
  getMyAgendas(@Query() {
    limit = 10,
    page = 1,
    title,
    location,
    sort_type,
    date_from,
    date_to
  }: AgendaQuery, @Req() request: Request) {
    const user: { userId } = request.user as { userId }
    return this.service.listSavedAgenda({
      limit,
      page,
      title,
      location,
      sort_type,
      date_from,
      date_to
    }, user.userId)
  }

  @UseGuards(JwtAuthGuard, RolePermissionGuard)
  @Roles('all')
  @Post(':id')
  @HttpCode(201)
  saveAgenda(@Param('id') id: string, @Req() request: Request) {
    const user: { userId } = request.user as { userId }
    return this.service.saveAgenda(id, user.userId)
  }

  @UseGuards(JwtAuthGuard, RolePermissionGuard)
  @Roles('all')
  @Delete(':id')
  @HttpCode(200)
  unsaveAgenda(@Param('id') id: string, @Req() request: Request) {
    const user: { userId } = request.user as { userId }
    return this.service.unsaveAgenda(id, user.userId)
  }
}