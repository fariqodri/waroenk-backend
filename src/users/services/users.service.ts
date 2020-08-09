import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { nanoid } from 'nanoid';
import * as bcrypt from 'bcrypt'

import { RegisterDto } from '../dto/users.dto';
import { UserEntity } from '../entities/users.entity';
import { ResponseBody } from '../../utils/response';
import { SALT_ROUNDS, BUYER_ROLE_ID } from '../../constants';
import { plainToClass } from 'class-transformer';
import { PermissionService } from '../../permission/permission.service';
import { UserRepository } from '../repositories/users.repository';
import { SellerAttributeRepository } from '../repositories/seller.repository';

@Injectable()
export class UsersService {
  public readonly users: UserEntity[];

  constructor(
    private permissionService: PermissionService,
    private userRepo: UserRepository,
    private sellerRepo: SellerAttributeRepository
  ) {}

  async findOne(params: { id?: string, email?: string }): Promise<any> {
    try{
      const user = await this.userRepo.findOneOrFail({ where: params })
      const seller = await this.sellerRepo.findOne({ where: { user: user.id }})
      console.log(seller)
      let response = {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        created_at: user.created_at,
        updated_at: user.updated_at,
        is_active: user.is_active,
        sellerId: seller? seller.id: null
      }
      return new ResponseBody(response)
    } catch(err) {
      throw new NotFoundException(new ResponseBody(null, 'user not found'))
    }
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
        password: encrypted,
        role: 'buyer',
        created_at: new Date(),
        updated_at: null,
        is_active: true
      }
      // TODO insert user to DB
      await this.userRepo.insert(user)
      await this.permissionService.addMemberToRole(user.id, BUYER_ROLE_ID)
      return plainToClass(UserEntity, user)
    } catch (err) {
      const errMessage: string = err.message
      if (errMessage.toLowerCase().includes('duplicate entry')) throw new BadRequestException(new ResponseBody(null, 'email has been taken'))
      throw err
    }
  }
}