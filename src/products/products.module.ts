import { Module } from '@nestjs/common';
import { CategoriesController } from './controllers/categories.controller';
import { ProductsController } from './controllers/products.controller';
import { CategoriesService } from './services/categories.service';
import { ProductsService } from './services/products.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryRepository } from './repositories/category.repository';
import { ProductRepository } from './repositories/product.repository';

@Module({
  imports: [TypeOrmModule.forFeature([CategoryRepository, ProductRepository])],
  controllers: [CategoriesController, ProductsController],
  providers: [CategoriesService, ProductsService]
})
export class ProductsModule {}
