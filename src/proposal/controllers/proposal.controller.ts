import { Controller, UseGuards, Get, Query, Req, HttpCode, Body, Post, UsePipes, Param } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolePermissionGuard } from '../../auth/guards/role.permission.guard';
import { Roles } from '../../utils/decorators';
import { Request } from 'express';
import { ProposalService } from '../services/proposal.service';
import { ProposalQuery, CreateProposalParam } from '../dto/proposal.dto';
import { ValidationPipe } from '../../utils/validation.pipe';

@Controller('proposal')
export class ProposalController {
  constructor(private service: ProposalService) {}

  @Get()
  listProposalItems(@Query() {
    type,
  }: ProposalQuery) {
    return this.service.listProposalItems(type)
  }

  @UseGuards(JwtAuthGuard, RolePermissionGuard)
  @Roles('all')
  @Get('myProposal')
  async listUserProposal(@Query() {
    limit = 10,
    page = 1,
    type,
  }: ProposalQuery, @Req() request: Request) {
    const user: { userId } = request.user as { userId }
    return this.service.listUserProposal({
      limit,
      page,
      type
    }, user.userId);
  }

  @Get(':id')
  async detailProposal(@Param('id') id: string) {
    return this.service.detailProposal(id);
  }

  @UsePipes(ValidationPipe)
  @UseGuards(JwtAuthGuard, RolePermissionGuard)
  @Roles('all')
  @Post()
  @HttpCode(201)
  async createProposal(@Body() param: CreateProposalParam, @Req() request: Request) {
    const user: { userId } = request.user as { userId }
    return this.service.saveProposal(param, user.userId);
  }
}
