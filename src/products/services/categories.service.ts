import { Injectable } from '@nestjs/common';
import { ResponseBody } from '../../utils/response';
import { CategoryEntity } from '../entities/category.entity';
import { CategoryRepository } from '../repositories/category.repository';

@Injectable()
export class CategoriesService {
  constructor(private categoryRepository: CategoryRepository) {}

  async findAll(search?: string): Promise<ResponseBody<CategoryEntity>> {
    let categories: CategoryEntity[];
    if (search) {
      categories = await this.categoryRepository
        .createQueryBuilder()
        .where('LOWER(name) LIKE :name', { name: `%${search.toLowerCase()}%` })
        .getMany();
      return new ResponseBody(categories);
    }
    categories = await this.categoryRepository.find();
    return new ResponseBody(categories);
  }
}
