import { Controller, Param, Put, HttpCode, UseGuards, Query, Get } from "@nestjs/common";
import { AdminService } from "../services/admin.service";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolePermissionGuard } from "../../auth/guards/role.permission.guard";
import { Roles } from "../../utils/decorators";
import { ListBuyersQuery } from "../dto/admin.dto";
import { ResponseBody } from "../../utils/response";

@Controller('admin')
export class AdminController {
  constructor(private service: AdminService) {}

  // @UseGuards(JwtAuthGuard, RolePermissionGuard)
  // @Roles('admin')
  @Put('seller/:id')
  @HttpCode(201)
  activateSeller(@Param('id') id: string) {
    return this.service.activateSeller(id)
  }

  @UseGuards(JwtAuthGuard, RolePermissionGuard)
  @Roles('admin')
  @Get('buyers')
  async listBuyers(@Query() {
    page = 1,
    limit = 10,
    sort_by = 'created',
    order = 'desc',
    active,
    name
  }: ListBuyersQuery) {
    const response = await this.service.listBuyers({
      page,
      limit,
      sort_by,
      order,
      active,
      name
    })
    return new ResponseBody(response)
  }
}
