import { Injectable } from '@nestjs/common';
import { AgendaRepository } from '../repositories/agenda.repository';
import { AgendaQuery } from '../dto/agenda.dto';
import { ResponseBody, ResponseListBody } from '../../utils/response';

@Injectable()
export class AgendaService {
  constructor(
    private agendaRepo: AgendaRepository
  ) {}

  async getAgenda(query: AgendaQuery): Promise<ResponseListBody<any[]>> {
    const skippedItems = (query.page - 1) * query.limit;
    let queryBuilder = this.agendaRepo
      .createQueryBuilder('agendas')
      .where('agendas.is_active IS TRUE');
    if (query.title) {
      queryBuilder = queryBuilder.andWhere('LOWER(agendas.title) LIKE :title', {
        title: `%${query.title.toLowerCase()}%`,
      });
    }
    if (query.location) {
      queryBuilder = queryBuilder.andWhere('LOWER(agendas.location) LIKE :location', {
        location: `%${query.location.toLowerCase()}%`,
      });
    }
    queryBuilder = queryBuilder
      .orderBy('agendas.created_at', 'DESC')
      .addOrderBy('agendas.title', 'ASC')
      .offset(skippedItems)
      .limit(query.limit)
      .select(
        `agendas.id AS id,
        agendas.title AS title,
        agendas.description AS description,
        agendas.location AS location,
        agendas.date AS date,
        agendas.images AS images`,
      );
    let agendas: any[] = await queryBuilder.execute();
    agendas = agendas.map(p => ({
      ...p,
      images: p.images.split(','),
    }));
    return new ResponseListBody(agendas, "ok", query.page, query.limit)
  }
}