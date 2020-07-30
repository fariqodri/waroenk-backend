import { Injectable } from '@nestjs/common';
import { ResponseListBody } from '../../utils/response';
import { FaqRepository } from '../repositories/faq.repository';
import { FaqQuery } from '../dto/faq.dto';

@Injectable()
export class MiscService {
  constructor(
    private faqRepo: FaqRepository
  ) {}

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