import { Module, DynamicModule, Global } from '@nestjs/common';
import { RedisService } from './redis.service';
import { ClientOpts } from 'redis';
import { RedisClientProvider } from './redis.client.provider';

@Global()
@Module({})
export class RedisModule {
  static register(options: ClientOpts): DynamicModule {
    return {
      module: RedisModule,
      providers: [
        {
          provide: 'REDIS_OPTIONS',
          useValue: options
        },
        RedisService,
        RedisClientProvider
      ],
      exports: [RedisService, RedisClientProvider]
    }
  }
}
