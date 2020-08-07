import { Injectable, BadRequestException } from '@nestjs/common';
import { ResponseListBody, ResponseBody } from '../../utils/response';
import { CartRepository } from '../repositories/cart.repository';
import { OrderRepository } from '../repositories/order.repository';
import { ProductRepository } from '../../products/repositories/product.repository';
import { UserRepository } from '../../users/repositories/users.repository';
import { CartEntity } from '../entities/cart.entity';
import { CreateCartParam } from '../dto/order.dto';

@Injectable()
export class OrderService {
  constructor(
    private cartRepo: CartRepository,
    private orderRepo: OrderRepository,
    private productRepo: ProductRepository,
    private userRepo: UserRepository
  ) {}

  async addCart(param: CreateCartParam, userId: string): Promise<ResponseBody<any>> {
    const user = await this.userRepo.findOne({
      where: {
        id: userId,
        is_active: true
      }
    })
    if (user === undefined) {
      throw new BadRequestException(new ResponseBody(null,
        "user with userId: [" + userId + "] is inactive so it can't add cart"))
    }
    const product = await this.productRepo.findOneOrFail(param.productId)
    let cart = await this.cartRepo.findOne({
      relations: ['user', 'product'],
      where: {
        user: userId,
        product: param.productId
      }
    })
    if (cart === undefined) {
      let newCart: CartEntity = {
        user: user,
        product: product,
        quantity: param.quantity,
        is_active: param.quantity > 0
      }
      await this.cartRepo.insert(newCart)
      const titit = await this.userRepo.find({
        relations: ['carts']
      })
      console.log(titit[0].carts)
      return new ResponseBody('new cart item successfully created')
    }
    cart.quantity = param.quantity
    cart.is_active = param.quantity > 0
    await this.cartRepo.save(cart)
    return new ResponseBody('cart item successfully edited')
  }

  async listCart(userId: string): Promise<ResponseListBody<any[]>> {
    let queryBuilder = this.cartRepo
      .createQueryBuilder('cart')
      .where('cart.userId = :userId', { userId: userId })
      .andWhere('cart.is_active IS TRUE');
    queryBuilder = queryBuilder
      .innerJoin('cart.product', 'product')
      .select(
        `cart.quantity AS quantity`,
      )
      .addSelect([
        'product.id AS product_id',
        'product.name AS product_name',
        'product.price_per_quantity AS price_per_quantity',
        'product.discount AS discount',
        'product.images AS images'
      ]);
    let carts: any[] = await queryBuilder.execute();
    return new ResponseListBody(carts, "ok", 1, carts.length)
  }
}