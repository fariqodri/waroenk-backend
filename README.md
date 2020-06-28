## Description

Repository of backend of Waroenk UMKM app. It uses NestJS framework and NodeJS.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# running dependencies
$ docker-compose up -d

# loading environment variables
$ cp .env.example .env.local && source .env.local

# development
$ npm run migration:run:dev
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Migration

This app does not use auto migration anymore. So you have to manually migrate the changes that you do in the entities.

```bash
# load env for database connection
$ source .env.local

# generate migration files
$ npm run migration:generate <migration-name>

# run the migration, executing the changes to tables in DB
$ npm run migration:run:dev
```

## NestJS Documentation

- Website - [https://nestjs.com](https://nestjs.com/)
