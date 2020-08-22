import { Injectable, BadRequestException } from '@nestjs/common';
import { ResponseListBody, ResponseBody } from '../../utils/response';
import { CartRepository } from '../repositories/cart.repository';
import { OrderRepository } from '../repositories/order.repository';
import { ProductRepository } from '../../products/repositories/product.repository';
import { UserRepository } from '../../users/repositories/users.repository';
import { CartEntity } from '../entities/cart.entity';
import { CreateCartParam, CreateOrderParam, UpdateOrderParam } from '../dto/order.dto';
import { nanoid } from 'nanoid';
import { SellerAttribute } from '../../users/entities/seller.entity';
import { OrderEntity } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { OrderItemRepository } from '../repositories/order-item.repository';
import { Cron } from '@nestjs/schedule';
import { LessThan } from 'typeorm';

@Injectable()
export class OrderService {
  constructor(
    private cartRepo: CartRepository,
    private orderRepo: OrderRepository,
    private orderItemRepo: OrderItemRepository,
    private productRepo: ProductRepository,
    private userRepo: UserRepository,
  ) {}

  @Cron('* 10 * * * *', { name: 'order' })
  async handleCron() {
    let today = new Date()
    let last7Days = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7)
    let last5Days = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 5)
    let newOrders = await this.orderRepo.find({
      where: {
        status: 'new',
        created_at: LessThan(last7Days)
      }
    })
    for (var order of newOrders) {
      order.status = 'canceled',
      order.updated_at = today
      await this.orderRepo.save(order)
    }
    let onDeliveryOrders = await this.orderRepo.find({
      where: {
        status: 'on_delivery',
        updated_at: LessThan(last5Days)
      }
    })
    for (var order of onDeliveryOrders) {
      order.status = 'finished',
      order.updated_at = today
      await this.orderRepo.save(order)
    }
  }

  findOrderById(orderId: string): Promise<OrderEntity> {
    return this.orderRepo.findOneOrFail(orderId)
  }

  async detailOrder(orderId: string): Promise<ResponseBody<any>> {
    const order = await this.orderRepo.findOneOrFail({
      relations: ['items'],
      where: { id: orderId }
    })
    let subtotal = order.fare
    for (var item of order.items) {
      const discount = item.product.discount
      const price = item.product.price_per_quantity
      subtotal += (price * (1 - discount)) * item.quantity
    }
    let response = {
      id: order.id,
      userId: order.user.id,
      sellerId: order.seller.id,
      items: order.items,
      status: order.status,
      address: order.address,
      recipient_name: order.recipient_name,
      recipient_number: order.recipient_number,
      fare: order.fare,
      courier: order.courier,
      notes: order.notes,
      payment_bank: order.payment_bank,
      account_owner: order.account_owner,
      account_number: order.account_number,
      payment_proof: order.payment_proof,
      receipt_number: order.receipt_number,
      created_at: order.created_at,
      updated_at: order.updated_at,
      subtotal: subtotal
    }
    return new ResponseBody(response)
  }

  async cancelOrder(orderId: string): Promise<ResponseBody<any>> {
    let order = await this.orderRepo.findOneOrFail(orderId)
    order.status = 'canceled'
    order.updated_at = new Date()
    await this.orderRepo.save(order)
    return new ResponseBody('order successfully canceled')
  }

  async finishOrder(orderId: string): Promise<ResponseBody<any>> {
    let order = await this.orderRepo.findOneOrFail(orderId)
    if (order.status == 'on_delivery') {
      order.status = 'finished'
      order.updated_at = new Date()
      await this.orderRepo.save(order)
      return new ResponseBody('order successfully finished')
    }
    throw new BadRequestException(new ResponseBody(null, "order can't be finished yet"))
  }

  async updateOrder(orderId: string, param: UpdateOrderParam): Promise<ResponseBody<any>> {
    let order = await this.orderRepo.findOneOrFail(orderId)
    if (param.fare && (order.status == 'new')) {
      order.fare = param.fare
      order.courier = param.courier
      order.notes = param.notes? param.notes: null
      order.status = 'waiting_for_payment'
    } else if (param.payment_proof && (order.status == 'waiting_for_payment')) {
      order.payment_proof = param.payment_proof
      order.payment_bank = param.payment_bank? param.payment_bank: null
      order.account_number = param.account_number? param.account_number: null
      order.account_owner = param.account_owner? param.account_owner: null
      order.status = 'processed'
    } else if (param.receipt_number && (order.status == 'processed')) {
      order.receipt_number = param.receipt_number
      order.status = 'on_delivery'
    }
    order.updated_at = new Date()
    await this.orderRepo.save(order)
    delete order.user
    return new ResponseBody(order, 'order successfully updated')
  }

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
      cartList.push(cart)
      sellerMap.set(seller, cartList)
    })
    let orders = []
    for (let [seller, carts] of sellerMap) {
      let newOrder: OrderEntity = {
        id: nanoid(11),
        user: user,
        seller: seller,
        status: 'new',
        address: param.address,
        recipient_name: param.recipient_name,
        recipient_number: param.recipient_number,
        created_at: new Date(),
        fare: 0,
        courier: null,
        notes: null,
        payment_bank: null,
        account_owner: null,
        account_number: null,
        payment_proof: null,
        receipt_number: null,
        updated_at: null,
        items: []
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
    for (let cart of carts) {
      cart.quantity = 0
      cart.is_active = false
      await this.cartRepo.save(cart)
    }
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

  async listCart(userId: string): Promise<ResponseListBody<any>> {
    let carts: CartEntity[] = await this.cartRepo.find({
      relations: ['user', 'product'],
      where: {
        user: userId,
        is_active: true
      }
    })
    if (carts === undefined) {
      throw new BadRequestException(new ResponseBody(null,
        `user with userId: [${userId}] has no active carts`))
    }
    carts = carts.map(p => ({
      ...p,
      discount: Number(p.product.discount),
      product_id: p.product.id,
      product_name: p.product.name,
      price_per_quantity: p.product.price_per_quantity,
      images: p.product.images
    }));
    let sellerMap: Map<SellerAttribute, CartEntity[]> = new Map()
    carts.forEach(function(cart) {
      let seller: SellerAttribute = cart.product.seller
      delete cart.user
      delete cart.product
      delete cart.is_active
      let cartList: CartEntity[] = sellerMap.has(seller)? sellerMap.get(seller): []
      cartList.push(cart)
      sellerMap.set(seller, cartList)
    })
    let response = []
    for (let [seller, carts] of sellerMap) {
      let products = []
      for (let i in carts) {
        products.push(carts[i])
      }
      response.push({
        seller: {
          sellerId: seller.id,
          sellerName: seller.shop_name
        },
        products: products
      })
    }
    return new ResponseListBody(response, "ok", 1, carts.length)
  }
}