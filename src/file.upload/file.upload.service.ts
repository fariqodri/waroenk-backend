import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as AWS from 'aws-sdk'
import { ResponseBody } from '../utils/response';
import { S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_BUCKET_NAME } from '../constants';

@Injectable()
export class FileUploadService {
  uploadFile(file: Buffer, mimeType: string, fileName: string): Promise<ResponseBody<string>> {
    const s3 = new AWS.S3({
      accessKeyId: S3_ACCESS_KEY_ID,
      secretAccessKey: S3_SECRET_ACCESS_KEY
    })
    const bucketName = S3_BUCKET_NAME
    return new Promise((resolve, reject) => {
      s3.upload({
        Bucket: bucketName,
        Key: fileName,
        Body: file,
        ContentType: mimeType
      }, (err, data) => {
        if (err) {
          return reject(new InternalServerErrorException(new ResponseBody(null, err.message)))
        }
        resolve(new ResponseBody(data.Location))
      })
    })
  }
}
