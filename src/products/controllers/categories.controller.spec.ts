import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from '../services/categories.service';

describe('Categories Controller', () => {
  let controller: CategoriesController;
  let service: CategoriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [CategoriesService]
    }).compile();

    controller = module.get<CategoriesController>(CategoriesController);
    service = module.get<CategoriesService>(CategoriesService)
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call CategoriesService', () => {
    const spy = jest.spyOn(service, "findAll")
    controller.findAll(null)
    expect(spy).toBeCalled()
  })
});
