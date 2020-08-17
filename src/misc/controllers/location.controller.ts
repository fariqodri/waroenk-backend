import { Controller, Get, Query } from "@nestjs/common"
import { MiscService } from "../services/misc.service";
import { LocationQuery } from "../dto/misc.dto";

@Controller('location')
export class LocationController {
  constructor(private service: MiscService) {}

  @Get()
  getFaqs(@Query() {
    type,
    search,
    province = '__',
    city = '__',
    district = '__'
  }: LocationQuery) {
    return this.service.listLocation({type,search,province,city,district})
  }
}