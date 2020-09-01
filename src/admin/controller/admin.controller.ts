import { Controller, Param, Put, HttpCode, UseGuards, Query, Get, Body } from "@nestjs/common";
import { AdminService } from "../services/admin.service";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolePermissionGuard } from "../../auth/guards/role.permission.guard";
import { Roles } from "../../utils/decorators";
import { ListBuyersQuery, ListSellerQuery, EditSellerParam, CountOrderParam, ListProposalParam } from "../dto/admin.dto";
import { ResponseListWithCountBody } from "../../utils/response";

@Controller('admin')
export class AdminController {
  constructor(private service: AdminService) {}

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
    const { total, result } = await this.service.listBuyers({
      page,
      limit,
      sort_by,
      order,
      active,
      name
    })
    return new ResponseListWithCountBody(result, 'ok', parseInt(page.toString()), parseInt(limit.toString()), total)
  }

  @UseGuards(JwtAuthGuard, RolePermissionGuard)
  @Roles('admin')
  @Get('seller')
  async listSeller(@Query() {
    page = 1,
    limit = 10,
    filter = 'none',
    sort_by = 'created',
    order = 'desc',
    name
  }: ListSellerQuery) {
    return this.service.listSeller({
      page,
      limit,
      filter,
      sort_by,
      order,
      name
    })
  }

  @UseGuards(JwtAuthGuard, RolePermissionGuard)
  @Roles('admin')
  @Put('seller/:id')
  @HttpCode(201)
  async editSeller(@Param() id: string, @Body() param: EditSellerParam) {
    return this.service.editSeller(param, id)
  }

  @UseGuards(JwtAuthGuard, RolePermissionGuard)
  @Roles('admin')
  @Get('user/count')
  async countUser() {
    return this.service.countUser()
  }

  @UseGuards(JwtAuthGuard, RolePermissionGuard)
  @Roles('admin')
  @Get('order/count')
  async countOrder(@Query() param: CountOrderParam) {
    return this.service.countOrder(param)
  }

  @UseGuards(JwtAuthGuard, RolePermissionGuard)
  @Roles('admin')
  @Get('proposal')
  async listProposal(@Query() {
    page = 1,
    limit = 10,
    type
  }: ListProposalParam) {
    return this.service.listProposal({ page, limit, type })
  }
}
