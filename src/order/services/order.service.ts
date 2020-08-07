import { Injectable, BadRequestException } from '@nestjs/common';
import { ResponseListBody, ResponseBody } from '../../utils/response';
import { CartRepository } from '../repositories/cart.repository';
import { OrderRepository } from '../repositories/order.repository';
import { ProductRepository } from '../../products/repositories/product.repository';
import { UserRepository } from '../../users/repositories/users.repository';
import { CartEntity } from '../entities/cart.entity';
import { CreateCartParam, CreateOrderParam } from '../dto/order.dto';
import { nanoid } from 'nanoid';
import { SellerAttribute } from '../../users/entities/seller.entity';
import { OrderEntity } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { OrderItemRepository } from '../repositories/order-item.repository';

@Injectable()
export class OrderService {
  constructor(
    private cartRepo: CartRepository,
    private orderRepo: OrderRepository,
    private orderItemRepo: OrderItemRepository,
    private productRepo: ProductRepository,
    private userRepo: UserRepository,
  ) {}

  async createOrder(param: CreateOrderParam, userId: string): Promise<ResponseBody<any>> {
    const user = await this.userRepo.findOne({
      where: {
        id: userId,
        is_active: true
      }
    })
    if (user === undefined) {
      throw new BadRequestException(new ResponseBody(null,
        "user with userId: [" + userId + "] is inactive so it can't checkout"))
    }
    let carts: CartEntity[] = await this.cartRepo.find({
      relations: ['user', 'product'],
      where: {
        user: userId,
        is_active: true
      }
    })
    if (carts === undefined) {
      throw new BadRequestException(new ResponseBody(null,
        "user with userId: [" + userId + "] has no active carts"))
    }
    let sellerMap: Map<SellerAttribute, CartEntity[]> = new Map()
    carts.forEach(function(cart) {
      let seller: SellerAttribute = cart.product.seller
      let cartList: CartEntity[] = sellerMap.has(seller)? sellerMap.get(seller): []
      sellerMap.set(seller, cartList)
    })
    let orders = []
    for (let [seller, carts] of sellerMap) {
      let newOrder = {
        id: nanoid(11),
        user: user,
        seller: seller,
        status: 'diajukan',
        address: param.address,
        created_at: new Date(),
        is_active: true
      }
      await this.orderRepo.insert(newOrder)
      let newInsertedOrder: OrderEntity = await this.orderRepo.findOne(newOrder.id)
      for (let i in carts) {
        let newOrderItem: OrderItem = {
          product: carts[i].product,
          order: newInsertedOrder,
          quantity: carts[i].quantity
        }
        await this.orderItemRepo.insert(newOrderItem)
      }
      orders.push(newOrder)
    }
    orders.forEach(function(p) {
      delete p.user
    })
    return new ResponseBody(orders)
  }

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