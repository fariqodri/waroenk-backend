import { Controller, Get, Query, Req, UseGuards, Param, Body, Post } from "@nestjs/common"
import { AgendaService } from "../services/agenda.service"
import { AgendaQuery } from "../dto/agenda.dto"
import { Request } from 'express';
import { OptionalJwtAuthGuard } from "../../auth/guards/optional-jwt-auth.guard"

@Controller('agenda')
export class AgendaController {
  constructor(private service: AgendaService) {}

  @Get()
  getAgendas(@Query() {
    limit = 10,
    page = 1,
    title,
    location,
    sort_type,
    date_from,
    date_to
  }: AgendaQuery) {
    return this.service.listAgenda({
      limit,
      page,
      title,
      location,
      sort_type,
      date_from,
      date_to
    })
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  detailAgenda(@Param() id: string, @Req() request: Request) {
    let userId = ''
    if (request.user) {
      const user: { userId } = request.user as { userId }
      userId = user.userId
    }
    return this.service.detailAgenda(id, userId)
  }
}