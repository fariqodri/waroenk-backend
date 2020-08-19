import { Controller, Param, Put, HttpCode, UseGuards } from "@nestjs/common";
import { AdminService } from "../services/admin.service";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { RolePermissionGuard } from "../../auth/guards/role.permission.guard";
import { Roles } from "../../utils/decorators";

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
}
