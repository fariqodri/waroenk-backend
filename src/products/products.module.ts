import { Module } from '@nestjs/common';
import { CategoriesController } from './controllers/categories.controller';
import { ProductsController } from './controllers/products.controller';
import { CategoriesService } from './services/categories.service';
import { ProductsService } from './services/products.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryRepository } from './repositories/category.repository';
import { ProductRepository } from './repositories/product.repository';
import { SellerCategoryRepository } from './repositories/seller-category.repository';
import { UserRepository } from '../users/repositories/users.repository';
import { LocationRepository } from '../misc/repositories/location.repository';

@Module({
  imports: [TypeOrmModule.forFeature([
    CategoryRepository,
    ProductRepository,
    UserRepository,
    SellerCategoryRepository,
    LocationRepository
  ])],
  controllers: [CategoriesController, ProductsController],
  providers: [CategoriesService, ProductsService],
  exports: [TypeOrmModule.forFeature([ProductRepository])]
})
export class ProductsModule {}
