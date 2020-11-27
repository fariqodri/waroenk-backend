import { Injectable } from '@nestjs/common';
import { RedisClientProvider } from './redis.client.provider';

@Injectable()
export class RedisService {
  constructor(private redisClient: RedisClientProvider) {}

  async get<T>(key: string, defaultValue?: T): Promise<T> {
    return new Promise((resolve, reject) => {
      this.redisClient.get(key, (err, reply) => {
        if (err) {
          reject(err)
          return
        }
        let result: T
        if (reply == null) {
          result = defaultValue != null ? defaultValue : null
        } else {
          result = JSON.parse(reply)
        }
        resolve(result)
      })
    })
  }

  async set(key: string, value: any, expirationTimeSeconds?: number): Promise<void> {
    return new Promise((resolve, reject) => {
      if (expirationTimeSeconds === undefined) {
        this.redisClient.set(key, JSON.stringify(value), (err, _) => {
          if (err) {
            reject(err)
            return
          }
          resolve()
        })  
      } else {
        this.redisClient.set(key, JSON.stringify(value), 'EX', expirationTimeSeconds, (err, _) => {
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
