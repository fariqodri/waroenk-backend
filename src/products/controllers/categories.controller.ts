import { Controller, Get, Query } from '@nestjs/common';
import { CategoriesService } from '../services/categories.service';

@Controller('categories')
export class CategoriesController {
  constructor(
    private categoriesService: CategoriesService
  ) {}

  @Get()
  findAll(@Query("search") search?: string) {
    return this.categoriesService.findAll(search)
  }
}
