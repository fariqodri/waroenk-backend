import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from './categories.service';
import { ResponseBody } from '../../utils/response';
import { Category } from '../entities/categories.entity';

describe('CategoriesService', () => {
  let service: CategoriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CategoriesService],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
  });

  it('should return valid response body', () => {
    let resp = service.findAll(null)
    expect(resp).toBeInstanceOf(ResponseBody)

    resp = service.findAll("sayuran")
    expect(resp.result).toEqual<Category[]>([{
      id: "category_1",
      name: "Sayuran",
      image: "s3_url_1"
    }])
  });
});
