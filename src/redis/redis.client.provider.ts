import { Injectable, Inject } from "@nestjs/common";
import { RedisClient, ClientOpts } from "redis";

@Injectable()
export class RedisClientProvider extends RedisClient {
  constructor(@Inject('REDIS_OPTIONS') options: ClientOpts) {
    super(options)
    super.on('connect', console.log)
  }
}
