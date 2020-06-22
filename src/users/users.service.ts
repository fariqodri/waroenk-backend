import { Injectable, BadRequestException } from '@nestjs/common';
import { nanoid } from 'nanoid';
import * as bcrypt from 'bcrypt'

import { RegisterDto } from './users.dto';
import { UserEntity } from './users.entity';
import { ResponseBody } from '../utils/response';
import { SALT_ROUNDS, BUYER_ROLE_ID } from '../constants';
import { plainToClass } from 'class-transformer';
import { PermissionService } from '../permission/permission.service';

@Injectable()
export class UsersService {
  public readonly users: UserEntity[];

  constructor(
    private permissionService: PermissionService
  ) {
    this.users = [
      {
        id: nanoid(11),
        full_name: "Full Name",
        email: "full@example.com",
        phone: "081223212321",
        password: 'changeme',
      },
      {
        id: nanoid(11),
        full_name: "Full Name",
        email: "full@example.com",
        phone: "081223212321",
        password: 'changeme',
      },
      {
        id: nanoid(11),
        full_name: "Full Name",
        email: "full@example.com",
        phone: "081223212321",
        password: 'changeme',
      },
    ];
  }

  async findOne(email: string): Promise<UserEntity | undefined> {
    return this.users.find(user => user.email === email);
  }

  async register(body: RegisterDto): Promise<UserEntity> {
    if (body.password != body.confirm_password) {
      throw new BadRequestException(new ResponseBody(null, "confirm password unequal with password"))
    }
    try {
      const encrypted = await bcrypt.hash(body.password, SALT_ROUNDS)
      const user: UserEntity = {
        id: nanoid(11),
        full_name: body.full_name,
        email: body.email,
        phone: body.phone,
        password: encrypted
      }
      // TODO insert user to DB
      this.users.push(user)
      await this.permissionService.addMemberToRole(user.id, BUYER_ROLE_ID)
      return plainToClass(UserEntity, user)
    } catch (err) {
      throw err
    }
  }
}