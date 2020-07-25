import { Controller, Post, HttpCode, UseInterceptors, UploadedFile, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express'
import { FileUploadService } from './file.upload.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('file')
export class FileUploadController {
  constructor(private service: FileUploadService){}

  @Post()
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFile() file) {
    return this.service.uploadFile(file.buffer, file.mimetype, file.originalname)
  }
}
