import { Test, TestingModule } from '@nestjs/testing';
import { FaqController } from './faq.controller';
import { MiscService } from '../services/misc.service';
import { FaqRepository } from '../repositories/faq.repository';
import { LocationRepository } from '../repositories/location.repository';
import { LocationController } from './location.controller';

jest.mock('../repositories/faq.repository')
jest.mock('../repositories/location.repository')

describe('Location Controller', () => {
  let controller: LocationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LocationController],
      providers: [MiscService, FaqRepository, LocationRepository]
    }).compile();

    controller = module.get<LocationController>(LocationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
