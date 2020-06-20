import { ConnectionOptions } from 'typeorm'

const config: ConnectionOptions = {
  type: "mysql",
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: process.env.NODE_ENV === "production" ? false : true,
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  migrationsTableName: "migrations",
  migrationsRun: false,
  logging: ["query"],
  logger: "file",
  migrations: ["migration/*.js"],
  cli: {
    "migrationsDir": "migration"
  }
}

module.exports = config
