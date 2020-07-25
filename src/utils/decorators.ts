import { SetMetadata, createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

type role = 'buyer' | 'seller' | 'all'

export const Roles = (...roles: role[]) => SetMetadata('roles', roles);
