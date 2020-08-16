import { Controller, Get, Query, Req, Post, Param } from "@nestjs/common"
import { MiscService } from "../services/misc.service";
import { FaqQuery } from "../dto/faq.dto";

@Controller('faq')
export class FaqController {
  constructor(private service: MiscService) {}

  @Get()
  getFaqs(@Query() {
    limit = 100,
    page = 1,
    search
  }: FaqQuery) {
    return this.service.listFaqs({
      limit,
      page,
      search
    })
  }

  // TEMPORARY ENDPOINT
  @Post(':id')
  activateSeller(@Param('id') id: string) {
    return this.service.activateSeller(id)
  }
}