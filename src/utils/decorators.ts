import { SetMetadata } from '@nestjs/common';

type role = 'buyer' | 'seller' | 'all'

export const Roles = (...roles: role[]) => SetMetadata('roles', roles);
