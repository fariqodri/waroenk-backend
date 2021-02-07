import { Injectable } from "@nestjs/common";
import { nanoid } from "nanoid";

import { UserRepository } from "../../users/repositories/users.repository";
import { SellerAttributeRepository } from "../../users/repositories/seller.repository";
import { ResponseBody, ResponseListWithCountBody } from "../../utils/response";
import { SellerAttribute } from "../../users/entities/seller.entity";
import { 
  ListUsersQuery,
  ListSellerQuery,
  EditSellerParam,
  CountOrderParam,
  ListProposalParam,
  ListDiscussionParam,
  CreateAgendaParam,
  EditAgendaParam,
  EditSellerCategoryParam
} from "../dto/admin.dto";
import { UsersProvider } from "../../users/providers/users.provider";
import { Like, Not } from "typeorm";
import { OrderRepository } from "../../order/repositories/order.repository";
import { ProposalRepository } from "../../proposal/repositories/proposal.repository";
import { DiscussionRepository } from "../../discussion/repositories/discussion.repository";
import { DiscussionEntity } from "../../discussion/entities/discussion.entity";
import { AgendaRepository } from "../../agenda/repositories/agenda.repository";
import { AgendaEntity } from "../../agenda/entities/agenda.entity";
import { SellerCategoryRepository } from "../../products/repositories/seller-category.repository";
import { SellerCategory } from "../../products/entities/seller-category.entity";
import { CategoryRepository } from "../../products/repositories/category.repository";
import { NotificationService } from "./notification.service";
import { ProposalDataRepository } from "../../proposal/repositories/proposal-data.repository";
import { ShippingAddressRepository } from "../../users/repositories/shipping-address.repository";
import { ShippingAddressEntity } from "../../users/entities/shipping-address.entity";
@Injectable()
export class AdminService {
  constructor(
    private userRepo: UserRepository,
    private sellerRepo: SellerAttributeRepository,
    private userProvider: UsersProvider,
    private orderRepo: OrderRepository,
    private proposalRepo: ProposalRepository,
    private proposalDataRepo: ProposalDataRepository,
    private discussionRepo: DiscussionRepository,
    private agendaRepo: AgendaRepository,
    private sellerCategoryRepo: SellerCategoryRepository,
    private categoryRepo: CategoryRepository,
    private notificationService: NotificationService,
    private shippingRepo: ShippingAddressRepository
  ) {}

  async deleteAgenda(id: string): Promise<ResponseBody<any>> {
    const agenda = await this.agendaRepo.findOneOrFail(id);
    agenda.updated_at = new Date();
    agenda.is_active = false;
    await this.agendaRepo.save(agenda);
    return new ResponseBody(null, `agenda [${agenda.id}] successfully deleted`);
  }

  async editAgenda(id: string, param: EditAgendaParam): Promise<ResponseBody<any>> {
    const agenda = await this.agendaRepo.findOneOrFail(id);
    agenda.updated_at = new Date();
    if (param.title) {
      agenda.title = param.title;
    }
    if (param.description) {
      agenda.description = param.description;
    }
    if (param.date) {
      agenda.date = new Date(param.date);
    }
    if (param.location) {
      agenda.location = param.location;
    }
    if (param.type) {
      agenda.type = param.type;
    }
    if (param.images) {
      agenda.images = param.images;
    }
    if (param.sponsors) {
      agenda.sponsors = param.sponsors;
    }
    await this.agendaRepo.save(agenda);
    return new ResponseBody(agenda, `agenda [${agenda.id}] successfully edited`);
  }

  async createAgenda(param: CreateAgendaParam): Promise<ResponseBody<any>> {
    const newAgenda: AgendaEntity = {
      id: nanoid(11),
      title: param.title,
      description: param.description,
      location: param.location,
      date: new Date(param.date),
      images: param.images,
      type: param.type,
      sponsors: param.sponsors,
      created_at: new Date(),
      updated_at: null,
      is_active: true
    };
    await this.agendaRepo.insert(newAgenda);
    return new ResponseBody(newAgenda, 'new agenda created');
  }

  async listDiscussion(param: ListDiscussionParam): Promise<ResponseBody<any>> {
    const skippedItems = (param.page - 1) * param.limit;
    let query = this.discussionRepo
      .createQueryBuilder('d')
      .orderBy('d.created_at', 'DESC')
      .innerJoin('d.user', 'user')
      .innerJoin('d.product', 'product')
      .select(`
        d.id AS id,
        d.parentId AS parentId,
        d.productId AS productId,
        d.description AS description,
        d.created_at AS created_at
      `)
      .addSelect([
        'user.id AS userId',
        'user.full_name AS userName',
        'product.name AS productName'
      ])
      .andWhere('d.deleted_at IS NULL');
    if (param.search !== undefined && param.search !== '') {
      query = query.andWhere('d.description LIKE :searchDescription AND d.deleted_at IS NULL', 
        { searchDescription: `%${param.search}%` });
      query = query.orWhere('user.full_name LIKE :searchUser AND d.deleted_at IS NULL', 
        { searchUser: `%${param.search}%` });
      query = query.orWhere('product.name LIKE :searchName AND d.deleted_at IS NULL', 
        { searchName: `%${param.search}%` });
    }
    const count = await query.getCount();
    query = query.offset(skippedItems).limit(param.limit);
    const discussions = await query.execute();
    return new ResponseListWithCountBody(discussions, 'ok', param.page, discussions.length, count);
  }

  async deleteDiscussion(id: string): Promise<ResponseBody<any>> {
    const discussions: DiscussionEntity[] = await this.discussionRepo.createQueryBuilder('d')
      .where('d.id = :id', { id: id })
      .orWhere('d.parentId = :parentId', { parentId: id }).getMany();
    for(const discussion of discussions) {
      discussion.deleted_at = new Date();
      discussion.updated_at = new Date();
    }
    await this.discussionRepo.save(discussions);
    return new ResponseBody(null, 'discussion deleted');
  } 

  async countOrder(param: CountOrderParam): Promise<ResponseBody<any>> {
    const dateFrom = new Date(param.yearFrom, param.monthFrom-1, param.dayFrom, 0, 0, 0);
    const dateTo = new Date(param.yearTo, param.monthTo-1, param.dayTo, 23, 59, 59, 999);
    const orderCount = await this.orderRepo.createQueryBuilder()
      .where(`created_at BETWEEN '${dateFrom.toISOString()}' AND '${dateTo.toISOString()}'`)
      .getCount();
    return new ResponseBody({ count: orderCount });
  }

  async countUser(): Promise<ResponseBody<any>> {
    const userCount = await this.userRepo.count({
      where: {
        is_active: true,
        role: Not('admin')
      }
    });
    const sellerCount = await this.sellerRepo.count({ is_active: true });
    const newSellerCount = await this.sellerRepo.count({ is_active: false });
    const response = {
      userCount: userCount,
      sellerCount: sellerCount,
      newSellerCount: newSellerCount
    };
    return new ResponseBody(response);
  }

  async listBuyers(query: ListUsersQuery) {
    return this.userProvider.listUsers(query);
  }

  async listProposal(param: ListProposalParam): Promise<ResponseBody<any>> {
    const skippedItems = (param.page - 1) * param.limit;
    let query = { is_active: true };
    if (param.type !== undefined && param.type !== '') {
      query = Object.assign({}, query, { type: param.type });
    }
    const proposals = await this.proposalRepo.find({
      relations: ['user'],
      where: query,
      skip: skippedItems,
      take: param.limit,
      order: { created_at: 'DESC' }
    });
    const proposalCount = await this.proposalRepo.count({ where: query });
    const response = []
    for (const proposal of proposals) {
      const proposalDatas = [];
      const dataOfProposal = await this.proposalDataRepo.find({
        where: {
          proposal: proposal.id
        },
        order: { key: 'ASC' }
      });
      for(const proposalData of dataOfProposal) {
        proposalDatas.push({
          key: proposalData.key,
          value: proposalData.value,
          is_active: proposalData.is_active
        })
      };
      response.push({
        id: proposal.id,
        data: proposalDatas,
        type: proposal.type,
        userId: proposal.user.id,
        userPhone: proposal.user.phone,
        userEmail: proposal.user.email,
        userName: proposal.user.full_name
      });
    }
    return new ResponseListWithCountBody(response, 'ok', param.page, proposals.length, proposalCount);
  }

  async getSeller(sellerId: string): Promise<ResponseBody<any>> {
    const seller = await this.sellerRepo.findOneOrFail(sellerId, {
      relations: ['user']
    });
    const categories = await this.sellerCategoryRepo.find({
      where: {
        seller: seller.id
      },
      order: { status: "DESC" }
    });
    const response = {
      id: seller.id,
      email: seller.user.email,
      phone: seller.user.phone,
      gender: seller.gender,
      birth_place: seller.birth_place,
      birth_date: seller.birth_date,
      activation_date: seller.activation_date,
      shop_address: seller.shop_address,
      description: seller.description,
      tier: seller.tier,
      is_active: seller.is_active,
      registered_category: categories
    };
    return new ResponseBody(response);
  }

  async createSellerCategory(sellerId:string, param: EditSellerCategoryParam): Promise<ResponseBody<any>> {
    const sellerCategory = await this.sellerCategoryRepo.findOne({
      relations: ['seller', 'category'],
      where: {
        seller: sellerId, category: param.category
      }
    });
    if (sellerCategory !== undefined) {
      return new ResponseBody(null, 'seller category exist');
    }
    const seller = await this.sellerRepo.findOneOrFail(sellerId);
    const category = await this.categoryRepo.findOneOrFail(param.category);
    const newSellerCategory: SellerCategory = {
      id: nanoid(11),
      seller: seller,
      category: category,
      activation_date: null,
      expiry_date: null,
      status: 'proposed'
    };
    await this.sellerCategoryRepo.insert(newSellerCategory);
    return new ResponseBody(null, 'seller category has been created');
  }

  async editSellerCategory(sellerId:string, param: EditSellerCategoryParam): Promise<ResponseBody<any>> {
    const sellerCategory = await this.sellerCategoryRepo.findOneOrFail({
      relations: ['seller', 'category'],
      where: {
        seller: sellerId, category: param.category
      }
    });
    if (param.status == 'blocked') {
      sellerCategory.activation_date = null;
      sellerCategory.expiry_date = null;
      await this.notificationService.sendTextNotification(sellerCategory,
        `kategori ${sellerCategory.category.name} anda telah diblokir`);
    } else {
      if (sellerCategory.status != 'not_paid') {
        sellerCategory.activation_date = new Date();
      }
      sellerCategory.expiry_date = param.expiry_date? new Date(param.expiry_date): null;
    }
    sellerCategory.status = param.status;
    await this.sellerCategoryRepo.save(sellerCategory);
    return new ResponseBody(null, 'seller category has been updated');
  }
  
  async listSeller(param: ListSellerQuery): Promise<ResponseBody<any>> {
    const skippedItems = (param.page - 1) * param.limit;
    let query = {};
    if (param.filter == 'category') {
      return this.listSellerByCategory(param);
    } else if (param.filter == 'verified') {
      query = { is_active: true };
    } else if (param.filter == 'not_verified') {
      query = { is_active: false };
    }
    if (param.name !== undefined && param.name !== '') {
      query = Object.assign({}, query, { shop_name: Like(`%${param.name}%`) });
    }
    let order = {};
    if (param.sort_by == 'created') {
      order = { created_at: param.order.toUpperCase() };
    } else if (param.sort_by == 'name') {
      order = { shop_name: param.order.toUpperCase() };
    }
    const seller = await this.sellerRepo.find({
      relations: ['user'],
      where: query,
      skip: skippedItems,
      take: param.limit,
      order: order
    });
    const count = await this.sellerRepo.count({
      where: query
    });
    const response = seller.map(p => ({
      ...p,
      userId: p.user.id,
      phone: p.user.phone,
      email: p.user.email,
      name: p.user.full_name,
      home_address: ''
    }));
    for (const p of response) {
      const shippingAddress = await this.shippingRepo.find({
        relations: ['location'],
        where: {
          user: p.user.id
        }
      });
      if (shippingAddress.length != 0) {
        const homeAddress = shippingAddress[0];
        const { street, kelurahan, kecamatan, city, post_code } = homeAddress;
        p.home_address = `${street}, ${kelurahan}, ${kecamatan}, ${city}, ${post_code}`;
      }
      delete p.user;
    };
    return new ResponseListWithCountBody(response, 'ok', param.page, seller.length, count);
  }

  async listSellerByCategory(param: ListSellerQuery): Promise<ResponseBody<any>> {
    const skippedItems = (param.page - 1) * param.limit;
    const query = this.sellerCategoryRepo.createQueryBuilder('sc')
      .innerJoinAndSelect('sc.seller', 'seller')
      .innerJoinAndSelect('sc.category', 'category')
      .where('categoryId = :category', { category: param.category })
      .andWhere('seller.is_active IS TRUE')
      .andWhere(`sc.status IN ('paid','not_paid')`);
    const count = await query.getCount();
    const categories = await query
      .innerJoinAndSelect('seller.user', 'user')
      .orderBy('sc.expiry_date', 'ASC')
      .addOrderBy('sc.activation_date', 'DESC')
      .skip(skippedItems).take(param.limit).getMany();
    const response = categories.map(p => ({
      ...p,
      userId: p.seller.user.id,
      phone: p.seller.user.phone,
      email: p.seller.user.email,
      name: p.seller.user.full_name
    }));
    response.forEach(function(p) {
      delete p.seller.user
    });
    return new ResponseListWithCountBody(response, 'ok', param.page, response.length, count);
  }

  async editSeller(param: EditSellerParam, sellerId: string): Promise<ResponseBody<any>> {
    const seller: SellerAttribute = await this.sellerRepo.findOneOrFail(sellerId, {
      relations: ['user']
    });
    seller.updated_at = new Date();
    if (param.active !== undefined) {
      seller.is_active = param.active;
      if (param.active) {
        seller.activation_date = new Date();
        const user = seller.user;
        user.role = 'seller';
        user.updated_at = new Date();
        await this.userRepo.save(user);
      }
    }
    if (param.tier !== undefined) {
      seller.tier = param.tier;
    }
    await this.sellerRepo.save(seller)
    return new ResponseBody(null, 'seller has been updated');
  }

  async mostSeller(): Promise<ResponseBody<any>> {
    const sub_district = `substr(d.shop_address, instr(d.shop_address, ',')+1)`;
    const district = `substr(${sub_district}, instr(${sub_district}, ',')+1)`;
    const city = `substr(${district}, instr(${district}, ',')+1)`;
    const response = await this.sellerRepo
      .createQueryBuilder('d')
      .select(`
         trim(${city}) AS city,
         COUNT(*) AS many
      `)
      .orderBy('many', 'DESC')
      .groupBy('city')
      .limit(5).execute();
    return new ResponseBody(response);
  }
}
