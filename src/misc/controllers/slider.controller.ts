import { Body, Controller, Delete, Get, Param, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { RolePermissionGuard } from "src/auth/guards/role.permission.guard";
import { Roles } from "src/utils/decorators";
import { SliderService } from "../services/slider.service";
import { SliderParam } from "../dto/misc.dto";

@Controller('slider')
export class SliderController {
  constructor(private service: SliderService) {}

  @Get()
  async getSliders() {
    return this.service.listSlider()
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolePermissionGuard)
  @Roles('admin')
  async createSlider(@Body() param: SliderParam) {
    return this.service.createSlider(param)
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolePermissionGuard)
  @Roles('admin')
  async deleteSlider(@Param() id: string) {
    return this.service.deleteSlider(id)
  }
}