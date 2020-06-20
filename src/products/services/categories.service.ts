import { Injectable } from '@nestjs/common';
import { ResponseBody } from '../../utils/response';
import { Category } from '../entities/categories.entity';

@Injectable()
export class CategoriesService {
  findAll(search?: string): ResponseBody<Category> {
    let categories: Category[] = [
      {
        id: 'category_1',
        name: 'Sayuran',
        image: 's3_url_1',
      },
      {
        id: 'category_2',
        name: 'Buah-buahan',
        image: 's3_url_1',
      },
    ]
    if (search) {
      categories = categories.filter(c => c.name.toLowerCase() == search.toLowerCase());
    }
    return new ResponseBody<Category>(categories);
  }
}
