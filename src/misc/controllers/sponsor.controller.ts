import { Body, Controller, Delete, Get, Param, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolePermissionGuard } from "../../auth/guards/role.permission.guard";
import { Roles } from "../../utils/decorators";
import { SponsorService } from "../services/sponsor.service";
import { SponsorParam } from "../dto/misc.dto";

@Controller('sponsors')
export class SponsorController {
  constructor(private service: SponsorService) {}

  @Get()
  async getSponsors(@Param() type: string) {
    return this.service.listSponsor(type)
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolePermissionGuard)
  @Roles('admin')
  async createSponsors(@Body() param: SponsorParam) {
    return this.service.createSponsor(param)
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolePermissionGuard)
  @Roles('admin')
  async deleteSponsor(@Param() id: string) {
    return this.service.deleteSponsor(id)
  }
}