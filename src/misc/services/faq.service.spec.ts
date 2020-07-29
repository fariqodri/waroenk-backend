import { Test, TestingModule } from '@nestjs/testing';
import { MiscService } from './faq.service';
import { FaqRepository } from '../repositories/faq.repository';

jest.mock('../repositories/faq.repository')

describe('Faq Service', () => {
  let service: MiscService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MiscService, FaqRepository],
    }).compile();

    service = module.get<MiscService>(MiscService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
});