import { Controller, Post, UseInterceptors, UploadedFile } from "@nestjs/common"
import { MiscService } from "../services/misc.service";
import { FileInterceptor } from "@nestjs/platform-express";

@Controller('bulk-upload')
export class BulkUploadController {
  constructor(private service: MiscService) {}

  @Post('user')
  @UseInterceptors(FileInterceptor('file'))
  parseUser(@UploadedFile() file) {
    return this.service.parseUser(file.buffer)
  }

  @Post('seller')
  @UseInterceptors(FileInterceptor('file'))
  parseSeller(@UploadedFile() file) {
    return this.service.parseSeller(file.buffer)
  }

  @Post('product')
  @UseInterceptors(FileInterceptor('file'))
  parseProduct(@UploadedFile() file) {
    return this.service.parseProduct(file.buffer)
  }
}