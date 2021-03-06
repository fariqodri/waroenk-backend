import { Injectable, BadRequestException } from '@nestjs/common';
import { AgendaRepository } from '../repositories/agenda.repository';
import { AgendaQuery } from '../dto/agenda.dto';
import { ResponseBody, ResponseListBody } from '../../utils/response';
import { UserRepository } from '../../users/repositories/users.repository';

@Injectable()
export class AgendaService {
  constructor(
    private agendaRepo: AgendaRepository,
    private userRepo: UserRepository
  ) {}

  async saveAgenda(id: string, userId: string): Promise<ResponseBody<any>> {
    const user = await this.userRepo.findOne({
      relations: ["savedAgendas"],
      where: {
        id: userId,
        is_active: true
      }
    })
    if (user === undefined) {
      throw new BadRequestException(new ResponseBody(null,
        "user with userId: [" + userId + "] is inactive so it can't save agenda"))
    }
    const agenda = await this.agendaRepo.findOneOrFail(id)
    if (user.savedAgendas) {
      user.savedAgendas = user.savedAgendas.filter(currentAgenda => currentAgenda.id !== id)
    } else {
      user.savedAgendas = []
    }
    user.savedAgendas.push(agenda)
    await this.userRepo.save(user)
    return new ResponseBody("agenda successfully saved")
  }

  async unsaveAgenda(id: string, userId: string): Promise<ResponseBody<any>> {
    const user = await this.userRepo.findOne({
      relations: ["savedAgendas"],
      where: {
        id: userId,
        is_active: true
      }
    })
    if (user === undefined) {
      throw new BadRequestException(new ResponseBody(null,
        "user with userId: [" + userId + "] is inactive so it can't unsave agenda"))
    }
    if (user.savedAgendas) {
      user.savedAgendas = user.savedAgendas.filter(currentAgenda => currentAgenda.id !== id)
    }
    await this.userRepo.save(user)
    return new ResponseBody("agenda successfully unsaved")
  }

  async listAgenda(query: AgendaQuery): Promise<ResponseListBody<any[]>> {
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
      queryBuilder = queryBuilder.andWhere('LOWER(agendas.location) IN (:...locations)', 
        { locations: query.location.toLowerCase().split(',') });
    }
    if (query.type) {
      queryBuilder = queryBuilder.andWhere('LOWER(agendas.type) LIKE :type', {
        type: `%${query.type.toLowerCase()}%`,
      });
    }
    if (query.sort_type) {
      if (query.sort_type == 'newest') {
        queryBuilder = queryBuilder.orderBy('agendas.created_at', 'DESC')
      } else if (query.sort_type == 'oldest') {
        queryBuilder = queryBuilder.orderBy('agendas.created_at', 'ASC')
      } else if (query.sort_type == 'closest') {
        queryBuilder = queryBuilder
          .andWhere('agendas.date >= :now', { now: new Date() })
          .orderBy('agendas.date', 'ASC')
      }
    }
    if (query.date_from || query.date_to) {
      if (query.date_from) {
        queryBuilder = queryBuilder.andWhere('agendas.date >= :from', { from: query.date_from })
      }
      if (query.date_to) {
        queryBuilder = queryBuilder.andWhere('agendas.date <= :to', { to: query.date_to })
      }
    }
    queryBuilder = queryBuilder
      .addOrderBy('agendas.title', 'ASC')
      .offset(skippedItems)
      .limit(query.limit)
      .select(
        `agendas.id AS id,
        agendas.title AS title,
        agendas.description AS description,
        agendas.location AS location,
        agendas.date AS date,
        agendas.images AS images,
        agendas.type AS type,
        agendas.sponsors AS sponsors`,
      );
    let agendas: any[] = await queryBuilder.execute();
    agendas = agendas.map(p => ({
      ...p,
      date: new Date(p.date),
      images: p.images? p.images.split(','): null,
      sponsors: p.sponsors? p.sponsors.split(','): null
    }));
    return new ResponseListBody(agendas, "ok", query.page, agendas.length)
  }

  async listSavedAgenda(query: AgendaQuery, userId: string): Promise<ResponseListBody<any[]>> {
    const skippedItems = (query.page - 1) * query.limit;
    let queryBuilder = this.agendaRepo
      .createQueryBuilder('agendas')
      .where('agendas.is_active IS TRUE')
      .andWhere('user.id = :userId', {
        userId: userId
      });
    if (query.title) {
      queryBuilder = queryBuilder.andWhere('LOWER(agendas.title) LIKE :title', {
        title: `%${query.title.toLowerCase()}%`,
      });
    }
    if (query.location) {
      queryBuilder = queryBuilder.andWhere('LOWER(agendas.location) IN (:...locations)', 
        { locations: query.location.toLowerCase().split(',') });
    }
    if (query.type) {
      queryBuilder = queryBuilder.andWhere('LOWER(agendas.type) LIKE :type', {
        type: `%${query.type.toLowerCase()}%`,
      });
    }
    if (query.sort_type) {
      if (query.sort_type == 'newest') {
        queryBuilder = queryBuilder.orderBy('agendas.created_at', 'DESC')
      } else if (query.sort_type == 'closest') {
        queryBuilder = queryBuilder
          .andWhere('agendas.date >= :now', { now: new Date() })
          .orderBy('agendas.date', 'ASC')
      }
    }
    if (query.date_from || query.date_to) {
      if (query.date_from) {
        queryBuilder = queryBuilder.andWhere('agendas.date >= :from', { from: query.date_from })
      }
      if (query.date_to) {
        queryBuilder = queryBuilder.andWhere('agendas.date <= :to', { to: query.date_to })
      }
    }
    queryBuilder = queryBuilder
      .addOrderBy('agendas.title', 'ASC')
      .offset(skippedItems)
      .limit(query.limit)
      .leftJoinAndSelect('agendas.users', 'user')
      .select(
        `agendas.id AS id,
        agendas.title AS title,
        agendas.description AS description,
        agendas.location AS location,
        agendas.date AS date,
        agendas.images AS images,
        agendas.type AS type,
        agendas.sponsors AS sponsors`,
      );
    let agendas: any[] = await queryBuilder.execute();
    agendas = agendas.map(p => ({
      ...p,
      date: new Date(p.date),
      images: p.images? p.images.split(','): null,
      sponsors: p.sponsors? p.sponsors.split(','): null
    }));
    return new ResponseListBody(agendas, "ok", query.page, agendas.length)
  }

  async detailAgenda(id: string, userId: string): Promise<ResponseBody<any>> {
    const agenda = await this.agendaRepo.findOneOrFail(id, { relations: ['users'] })
    const users = agenda.users
    let isMyAgenda = false
    for (const i in users) {
      if (users[i].id == userId) {
        isMyAgenda = true
        break
      }
    }
    const response = {
      id: agenda.id,
      title: agenda.title,
      description: agenda.description,
      location: agenda.location,
      date: agenda.date,
      type: agenda.type,
      images: agenda.images,
      sponsors: agenda.sponsors,
      is_active: agenda.is_active,
      is_my_agenda: isMyAgenda
    }
    return new ResponseBody(response)
  }
}