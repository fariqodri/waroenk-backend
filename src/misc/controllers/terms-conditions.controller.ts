import { BadRequestException, Controller, Get, Param, Post, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { Roles } from "../../utils/decorators";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { FileInterceptor } from "@nestjs/platform-express";
import * as path from 'path'
import { ResponseBody } from "../../utils/response";
import { SellerTermsConditionsService } from "../services/terms-conditions.service";
import { RolePermissionGuard } from "../../auth/guards/role.permission.guard";

@Controller('seller-terms-conditions')
export class SellerTermsConditionsController {
  constructor(private readonly service: SellerTermsConditionsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolePermissionGuard)
  @Roles('admin')
  @UseInterceptors(FileInterceptor('file', {
    fileFilter: (req, file, cb) => {
      const ext = path.extname(file.originalname)
      const allowedExtensions = ['.md']
      if (!allowedExtensions.includes(ext)) {
        return cb(new BadRequestException(new ResponseBody(null, 'file type not allowed')), false)
      }
      return cb(null, true)
    },
    limits: {
      fieldSize: 20000 // 20 MB
    }
  }))
  async uploadTermsAndConditions(@UploadedFile() file) {
    const result = await this.service.uploadTermsAndConditions(file.buffer, file.mimetype, file.originalname)
    return new ResponseBody(result)
  }

  @Get(':version')
  async getTermsAndConditionsByVersion(@Param('version') version: string) {
    if (version == 'latest') {
      const latestTermsConditions = await this.service.getLatestTermsAndCondition()
      return new ResponseBody(latestTermsConditions)
    }
    const versionInNumber = parseInt(version)
    const versionedTermsConditions = await this.service.getTermsAndConditionsByVersion(versionInNumber)
    return new ResponseBody(versionedTermsConditions)
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolePermissionGuard)
  @Roles('admin')
  async getTermsAndConditionsList() {
    const termsAndConditionsList = await this.service.getTermsAndConditionsList()
    return new ResponseBody(termsAndConditionsList)
  }
}