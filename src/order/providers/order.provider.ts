import { Injectable } from "@nestjs/common";
import { ProductEntity } from "../../products/entities/product.entity";
import { FindOneOptions } from "typeorm";
import { OrderItem } from "../entities/order-item.entity";
import { OrderEntity } from "../entities/order.entity";
import { OrderItemRepository } from "../repositories/order-item.repository";
import { OrderRepository } from "../repositories/order.repository";

@Injectable()
export class OrderProvider {
  constructor(
    private readonly orderRepo: OrderRepository,
    private readonly orderItemRepo: OrderItemRepository
  ) {}
  async findOrderById(orderId: string, option?: FindOneOptions<OrderEntity>): Promise<OrderEntity> {
    const res = await this.orderRepo.createQueryBuilder('order')
      .select(['order.id', 'order.status', 'order.fare'])
      .addSelect(qb => {
        return qb
          .select('SUM(p.price_per_quantity * oi.quantity)', 'price')
          .from(OrderItem, 'oi')
          .leftJoin(ProductEntity, 'p', 'oi.productId = p.id')
          .where('oi.orderId = order.id')
          .groupBy('oi.orderId')
      }, 'order_price')
      .where('order.id = :orderId', { orderId })
      .getRawOne()
    return this.orderRepo.create({
      id: res.order_id,
      status: res.order_status,
      fare: Number(res.order_fare) + Number(res.order_price)
    })
  }

  countProductsOfOrder(orderId: string): Promise<number> {
    return this.orderItemRepo.count({
      where: {
        order: {
          id: orderId
        }
      }
    })
  }
}