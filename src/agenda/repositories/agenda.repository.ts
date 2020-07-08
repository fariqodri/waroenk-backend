import { EntityRepository, Repository } from 'typeorm'
import { AgendaEntity } from '../entities/agenda.entity';

@EntityRepository(AgendaEntity)
export class AgendaRepository extends Repository<AgendaEntity> {}
