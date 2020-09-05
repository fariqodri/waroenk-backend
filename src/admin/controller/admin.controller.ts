import { Controller, Param, Put, HttpCode, UseGuards, Query, Get, Body, Delete, Post } from "@nestjs/common";
import { AdminService } from "../services/admin.service";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolePermissionGuard } from "../../auth/guards/role.permission.guard";
import { Roles } from "../../utils/decorators";
import { ListBuyersQuery, ListSellerQuery, EditSellerParam, CountOrderParam, ListProposalParam, ListDiscussionParam, CreateAgendaParam, EditSellerCategoryParam } from "../dto/admin.dto";
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
    category,
    sort_by = 'created',
    order = 'desc',
    name
  }: ListSellerQuery) {
    return this.service.listSeller({
      page,
      limit,
      filter,
      category,
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
  @Get('seller/:id')
  async getSeller(@Param() id: string) {
    return this.service.getSeller(id)
  }

  @UseGuards(JwtAuthGuard, RolePermissionGuard)
  @Roles('admin')
  @Post('seller-category/:id')
  async createSellerCategory(@Param() id: string, @Body() param: EditSellerCategoryParam) {
    return this.service.createSellerCategory(id, param)
  }

  @UseGuards(JwtAuthGuard, RolePermissionGuard)
  @Roles('admin')
  @Put('seller-category/:id')
  @HttpCode(201)
  async editSellerCategory(@Param() id: string, @Body() param: EditSellerCategoryParam) {
    return this.service.editSellerCategory(id, param)
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

  @UseGuards(JwtAuthGuard, RolePermissionGuard)
  @Roles('admin')
  @Get('discussion')
  async listDiscussion(@Query() {
    page = 1,
    limit = 10,
    search
  }: ListDiscussionParam) {
    return this.service.listDiscussion({ page, limit, search })
  }

  @UseGuards(JwtAuthGuard, RolePermissionGuard)
  @Roles('admin')
  @Delete('discussion/:id')
  async deleteDiscussion(@Param() id: any) {
    return this.service.deleteDiscussion(id.id)
  }

  @UseGuards(JwtAuthGuard, RolePermissionGuard)
  @Roles('admin')
  @Post('agenda')
  async createAgenda(@Body() param: CreateAgendaParam) {
    return this.service.createAgenda(param)
  }

  @UseGuards(JwtAuthGuard, RolePermissionGuard)
  @Roles('admin')
  @Put('agenda/:id')
  @HttpCode(201)
  async editAgenda(@Param() id: string, @Body() param: CreateAgendaParam) {
    return this.service.editAgenda(id, param)
  }

  @UseGuards(JwtAuthGuard, RolePermissionGuard)
  @Roles('admin')
  @Delete('agenda/:id')
  @HttpCode(201)
  async deleteAgenda(@Param() id: string) {
    return this.service.deleteAgenda(id)
  }
}
