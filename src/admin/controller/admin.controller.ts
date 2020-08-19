import { Controller, Param, Put, HttpCode } from "@nestjs/common";
import { AdminService } from "../services/admin.service";

@Controller('admin')
export class AdminController {
  constructor(private service: AdminService) {}

  @Put('seller/:id')
  @HttpCode(201)
  activateSeller(@Param('id') id: string) {
    return this.service.activateSeller(id)
  }
}
