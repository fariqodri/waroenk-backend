import { Controller, Post, UseInterceptors, UploadedFile } from "@nestjs/common"
import { MiscService } from "../services/misc.service";
import { FileInterceptor } from "@nestjs/platform-express";

@Controller('bulk-upload/user')
export class BulkUploadController {
  constructor(private service: MiscService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  parseUser(@UploadedFile() file) {
    return this.service.parseUser(file)
  }
}