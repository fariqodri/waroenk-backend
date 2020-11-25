import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from './categories.service';
import { CategoryRepository } from '../repositories/category.repository';

jest.mock('../repositories/category.repository')

describe('CategoriesService', () => {
  let service: CategoriesService;
  let categoryRepo: CategoryRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CategoriesService, CategoryRepository],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    categoryRepo = module.get(CategoryRepository);
  });

  it('should call query builder', async () => {
    const spy = jest.spyOn(categoryRepo, "find")
    await service.findAll(null)
    expect(spy).toBeCalled()
  });
});
