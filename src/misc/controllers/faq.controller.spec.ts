import { Test, TestingModule } from '@nestjs/testing';
import { FaqController } from './faq.controller';
import { MiscService } from '../services/faq.service';
import { FaqRepository } from '../repositories/faq.repository';

jest.mock('../repositories/faq.repository')

describe('Faq Controller', () => {
  let controller: FaqController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FaqController],
      providers: [MiscService, FaqRepository]
    }).compile();

    controller = module.get<FaqController>(FaqController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
