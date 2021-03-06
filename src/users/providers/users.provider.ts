import { Injectable } from "@nestjs/common";
import { UserRepository } from "../repositories/users.repository";
import { ListUsersQuery } from "../../admin/dto/admin.dto";
import { UserEntity } from "../entities/users.entity";

@Injectable()
export class UsersProvider {
  constructor(
    private readonly userRepo: UserRepository
  ) {}

  async listUsers(query: ListUsersQuery): Promise<{total: number, result: UserEntity[]}> {
    const skippedItems = (query.page - 1) * query.limit;
    let order: 'ASC' | 'DESC';
    switch (query.order) {
      case 'asc':
        order = 'ASC';
        break;
      case 'desc':
        order = 'DESC';
        break;
      default:
        order = 'DESC';
        break;
    }
    let queryBuilder = this.userRepo
      .createQueryBuilder('user')
      .orderBy(query.sort_by === 'created' ? 'user.created_at' : 'user.full_name', order)
      .select([
        'user.id',
        'user.full_name',
        'user.email',
        'user.phone',
        'user.role',
        'user.created_at',
        'user.updated_at',
        'user.is_active',
      ])
    if (query.active !== undefined) {
      queryBuilder = queryBuilder.andWhere('user.is_active = :isActive', {
        isActive: query.active,
      });
    }
    if (query.name !== undefined && query.name !== '') {
      queryBuilder = queryBuilder.andWhere('LOWER(user.full_name) LIKE :name', {
        name: `%${query.name.toLowerCase()}%`,
      });
    }
    const total = await queryBuilder.getCount()
    queryBuilder = queryBuilder
      .offset(skippedItems)
      .limit(query.limit)
    return {
      total,
      result: await queryBuilder.getMany()
    }
  }
}
