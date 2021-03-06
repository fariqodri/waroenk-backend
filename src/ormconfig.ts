import { ConnectionOptions } from 'typeorm'

const config: ConnectionOptions = {
  type: "mysql",
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: false,
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  logging: process.env.NODE_ENV == 'production' || process.env.NODE_ENV == 'staging' ? ['error', 'warn'] : 'all',
  logger: "simple-console",
  migrationsRun: false,
  migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
  cli: {
    migrationsDir: 'src/migrations',
  },
  timezone: 'Asia/Jakarta',
}

module.exports = config
