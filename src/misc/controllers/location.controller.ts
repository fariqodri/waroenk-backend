import { Controller, Get, Query, Req } from "@nestjs/common"
import { MiscService } from "../services/misc.service";
import { LocationQuery } from "../dto/faq.dto";

@Controller('location')
export class LocationController {
  constructor(private service: MiscService) {}

  @Get()
  getFaqs(@Query() param: LocationQuery) {
    return this.service.listLocation(param)
  }
}