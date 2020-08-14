import { Injectable } from '@nestjs/common';
import { ResponseListBody, ResponseBody } from '../../utils/response';
import { FaqRepository } from '../repositories/faq.repository';
import { FaqQuery, LocationQuery } from '../dto/faq.dto';
import { LocationRepository } from '../repositories/location.repository';
import { CsvParser } from 'nest-csv-parser'
import fs from 'fs';

class UserParsed {
  full_name: string
  email: string
  phone: string
}

@Injectable()
export class MiscService {
  constructor(
    private faqRepo: FaqRepository,
    private locationRepo: LocationRepository,
    private csvParser: CsvParser
  ) {}

  async parseUser(file: Buffer): Promise<ResponseBody<any[]>> {
    // const stream = fs.createReadStream(file)
    const entities = await this.csvParser.parse(file, UserParsed)
    // console.log(entities.list)
    return new ResponseBody(entities.list)
  }

  async listLocation(query: LocationQuery): Promise<ResponseBody<any[]>> {
    let index: number = 0
    let queryBuilder = await this.locationRepo
      .createQueryBuilder()
      .select('*')
      .orderBy('nama', 'ASC');
    if (query.type == 'province') {
      queryBuilder = queryBuilder.where('kode NOT LIKE :regex', {
        regex: '%.%'
      })
    } else if (query.type == 'city') {
      queryBuilder = queryBuilder.where('kode LIKE :regex', {
        regex: `${query.province}.__`
      })
      index = 1
    } else if (query.type == 'district') {
      queryBuilder = queryBuilder.where('kode LIKE :regex', {
        regex: `${query.province}.${query.city}.__`
      })
      index = 2
    } else if (query.type == 'sub-district') {
      queryBuilder = queryBuilder.where('kode LIKE :regex', {
        regex: `${query.province}.${query.city}.${query.district}.%`
      })
      index = 3
    }
    let results: any[] = await queryBuilder.execute()
    results = results.map(p => ({
      ...p,
      kode: p.kode.split('.')[index]
    }));
    return new ResponseBody(results)
  }

  async listFaqs(query: FaqQuery): Promise<ResponseListBody<any[]>> {
    const skippedItems = (query.page - 1) * query.limit;
    let queryBuilder = await this.faqRepo
      .createQueryBuilder('faq');
    if (query.search) {
      queryBuilder = queryBuilder.andWhere('LOWER(faq.title) LIKE :title', {
        title: `%${query.search.toLowerCase()}%`,
      });
      queryBuilder = queryBuilder.orWhere('LOWER(faq.description) LIKE :description', {
        description: `%${query.search.toLowerCase()}%`,
      });
    }
    queryBuilder = queryBuilder
      .orderBy('faq.created_at', 'DESC')
      .addOrderBy('faq.title', 'ASC')
      .offset(skippedItems)
      .limit(query.limit)
      .select(
        `faq.id AS id,
        faq.title AS title,
        faq.description AS description`,
      );
    let faqs: any[] = await queryBuilder.execute();
    return new ResponseListBody(faqs, "ok", query.page, faqs.length)
  }
}