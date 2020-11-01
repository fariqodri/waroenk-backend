import { EntityRepository, Repository } from 'typeorm';
import { SliderEntity } from '../entities/slider.entity';

@EntityRepository(SliderEntity)
export class SliderRepository extends Repository<SliderEntity> {}
