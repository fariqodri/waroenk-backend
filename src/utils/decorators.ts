import { SetMetadata } from '@nestjs/common';

type role = 'buyer' | 'seller' | 'admin' | 'all'

export const Roles = (...roles: role[]) => SetMetadata('roles', roles);
