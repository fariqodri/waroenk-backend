import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolePermissionGuard } from "../../auth/guards/role.permission.guard";
import { Roles } from "../../utils/decorators";
import { SponsorService } from "../services/sponsor.service";
import { SponsorParam } from "../dto/misc.dto";

@Controller('sponsors')
export class SponsorController {
  constructor(private service: SponsorService) {}

  @Get()
  async getSponsors(@Query() { type } ) {
    return this.service.listSponsor(type)
  }

  @UseGuards(JwtAuthGuard, RolePermissionGuard)
  @Roles('admin')
  @Post()
  async createSponsors(@Body() param: SponsorParam) {
    return this.service.createSponsor(param)
  }

  @UseGuards(JwtAuthGuard, RolePermissionGuard)
  @Roles('admin')
  @Delete(':id')
  async deleteSponsor(@Param() id: string) {
    return this.service.deleteSponsor(id)
  }

  @UseGuards(JwtAuthGuard, RolePermissionGuard)
  @Roles('admin')
  @Put(':id')
  async editSponsor(@Param() id: string, @Body() param: SponsorParam) {
    return this.service.editSponsor(id, param)
  }
}