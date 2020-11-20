import { Injectable } from '@nestjs/common';
import { RedisClientProvider } from './redis.client.provider';

@Injectable()
export class RedisService {
  constructor(private redisClient: RedisClientProvider) {}

  async get<T>(key: string): Promise<T> {
    return new Promise((resolve, reject) => {
      this.redisClient.get(key, (err, reply) => {
        if (err) {
          reject(err)
          return
        }
        resolve(JSON.parse(reply))
      })
    })
  }

  async set(key: string, value: any, expirationTime?: number): Promise<void> {
    return new Promise((resolve, reject) => {
      if (expirationTime === undefined) {
        this.redisClient.set(key, JSON.stringify(value), (err, _) => {
          if (err) {
            reject(err)
            return
          }
          resolve()
        })  
      } else {
        this.redisClient.set(key, JSON.stringify(value), 'EX', expirationTime, (err, _) => {
          if (err) {
            reject(err)
            return
          }
          resolve()
        })
      }
      
    })
  }
}
