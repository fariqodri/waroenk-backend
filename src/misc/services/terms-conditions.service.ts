import { Injectable, NotFoundException } from "@nestjs/common";
import { ResponseBody } from "../../utils/response";
import { FileUploadService } from "../../file.upload/file.upload.service";
import { SellerTermsConditionsRepository } from "../repositories/terms-conditions.repository";

@Injectable()
export class SellerTermsConditionsService {
  constructor(
    private readonly fileUploadService: FileUploadService,
    private readonly sellerTermsConditionsRepo: SellerTermsConditionsRepository
  ) {}

  async uploadTermsAndConditions(file: Buffer, mimeType: string, fileName: string): Promise<{ version: number, file: string }> {
    const fileUrl = (await this.fileUploadService.uploadFile(file, mimeType, fileName)).result as string
    const { version, file: createdFile } = await this.sellerTermsConditionsRepo.save({
      file: fileUrl
    })
    return {
      version,
      file: createdFile
    }
  }

  async getTermsAndConditionsByVersion(version: number): Promise<{ version: number, file: string }> {
    try {
      const sellerTermsAndConditionItem = await this.sellerTermsConditionsRepo.findOneOrFail(version)
      return {
        version: sellerTermsAndConditionItem.version,
        file: sellerTermsAndConditionItem.file
      }
    } catch {
      throw new NotFoundException(new ResponseBody(null, 'T&C not found'))
    }
  }
  
  async getLatestTermsAndCondition(): Promise<{ version: number, file: string }> {
    const sellerTermsAndConditionItem = await this.sellerTermsConditionsRepo.find({
      order: {
        version: 'DESC'
      },
      take: 1
    })
    const termsConditionItemNotExists = sellerTermsAndConditionItem.length == 0
    if (termsConditionItemNotExists) {
      throw new NotFoundException(new ResponseBody(null, 'T&C not found'))
    }
    const latestTermsConditions = sellerTermsAndConditionItem[0]
    return {
      version: latestTermsConditions.version,
      file: latestTermsConditions.file
    }
  }

  getTermsAndConditionsList(): Promise<{ version: number, file: string }[]> {
    return this.sellerTermsConditionsRepo.find({
      select: ['version', 'file'],
      order: {
        version: 'DESC'
      }
    })
  }
}