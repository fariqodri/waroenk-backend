import { Controller, Get, Query, Req } from "@nestjs/common"
import { AgendaService } from "../services/agenda.service"
import { AgendaQuery } from "../dto/agenda.dto"

@Controller('agenda')
export class AgendaController {
  constructor(private service: AgendaService) {}

  @Get()
  getProducts(@Query() {
    limit = 10,
    page = 1,
    title,
    location
  }: AgendaQuery) {
    return this.service.getAgenda({
      limit,
      page,
      title,
      location
    })
  }
}