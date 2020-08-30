import { CategoryEntity } from '../src/products/entities/category.entity';
import { UserEntity } from '../src/users/entities/users.entity';
import { SellerAttribute } from '../src/users/entities/seller.entity';
import { ProductEntity } from '../src/products/entities/product.entity';
import { DiscussionEntity } from '../src/discussion/entities/discussion.entity';
import { AgendaEntity } from '../src/agenda/entities/agenda.entity';
import { ProposalEntity } from '../src/proposal/entities/proposal.entity';
import { ProposalData } from '../src/proposal/entities/proposal-data.entity';
import { OrderEntity } from '../src/order/entities/order.entity';
import { OrderItem } from '../src/order/entities/order-item.entity';
import { CartEntity } from '../src/order/entities/cart.entity';
import { ChatEntity } from '../src/chat/entities/chat.entity';
import { ChatRoomEntity } from '../src/chat/entities/chat-room.entity';
import { ExecutionContext } from '@nestjs/common';
import { ShippingAddressEntity } from '../src/users/entities/shipping-address.entity';
import { LocationEntity } from '../src/misc/entities/location.entity';
import { FaqEntity } from '../src/misc/entities/faq.entity';
import { ProposalItem } from '../src/proposal/entities/proposal-item.entity';
import { PostEntity } from '../src/post/post.entity';
import { SellerBank } from '../src/users/entities/seller-bank.entity';

export const entities = [
  CategoryEntity,
  UserEntity,
  SellerAttribute,
  ProductEntity,
  DiscussionEntity,
  AgendaEntity,
  ProposalEntity,
  ProposalData,
  OrderEntity,
  OrderItem,
  CartEntity,
  ChatEntity,
  ChatRoomEntity,
  ShippingAddressEntity,
  LocationEntity,
  FaqEntity,
  ProposalItem,
  PostEntity,
  SellerBank
];

export const fakeJwtAuthGuardFactory = (session: any) => ({
  canActivate: jest.fn().mockImplementation((context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest();
    req.user = session;
    return true;
  }),
});

export const fakeRedisClientProvider = {
  set: jest
    .fn()
    .mockImplementation((key, value, mode, duration, cb) => cb(null, 'OK')),
  get: jest.fn().mockImplementation((key, cb) => cb(null, `{}`)),
};
