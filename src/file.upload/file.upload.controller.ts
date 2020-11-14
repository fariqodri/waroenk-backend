import { Controller, Post, HttpCode, UseInterceptors, UploadedFile, UseGuards, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express'
import { FileUploadService } from './file.upload.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import * as path from 'path'
import { ResponseBody } from '../utils/response';

@Controller('file')
export class FileUploadController {
  constructor(private service: FileUploadService){}

  @Post()
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', {
    fileFilter: (req, file, cb) => {
      const ext = path.extname(file.originalname)
      const allowedExtensions = ['.png', '.jpeg', '.jpg', '.pdf', '.csv']
      if (!allowedExtensions.includes(ext)) {
        return cb(new BadRequestException(new ResponseBody(null, 'file type not allowed')), false)
      }
      return cb(null, true)
    }
  }))
  uploadFile(@UploadedFile() file) {
    return this.service.uploadFile(file.buffer, file.mimetype, file.originalname)
  }
}
