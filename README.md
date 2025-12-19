# app.api.one.sabay.com

[![pipeline status](https://git.sabay.com/sabay-one/backend/app.api.one.sabay.com/badges/master/pipeline.svg)](https://git.sabay.com/sabay-one/backend/app.api.one.sabay.com/commits/master)
[![coverage report](https://git.sabay.com/sabay-one/backend/app.api.one.sabay.com/badges/master/coverage.svg)](https://git.sabay.com/sabay-one/backend/app.api.one.sabay.com/commits/master)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com)

# GraphQL API for Sabay One

Sabay One API is a unified backend service designed to handle core functionality related to user purchases, transactions, payment integration, preference management, and tracking across Sabay’s digital ecosystem.

It exposes modular APIs (REST + GraphQL) used by web and mobile clients for real-time transaction handling, user operations, and content validation.

## Setup
1. Clone the repo
`git clone https://git.sabay.com/sabay-one/backend/app.api.one.sabay.com.git`
2. From root directory run make config to generate .env file.
3. Create docker-compose.yml file on root directory and add below:
```
version: '3.8'
services:
  app:
    build:
      context: .
      dockerfile: ./build/app/Dockerfile.dev
    env_file:
      - .env
    ports:
      - 3001:3001
    volumes:
      - ./src:/home/node/app/src:rw
    container_name: one-api.local
    networks:
      - sabay_docker

  worker:
    build:
      context: .
      dockerfile: ./build/app/Dockerfile.dev
    command: 'worker:start'
    env_file:
      - .env
    volumes:
      - ./src:/home/node/app/src:rw
    networks:
      - sabay_docker

networks:
  sabay_docker:
    external: true
```

4.Build docker image by running

`docker-compose build`
5. Get your docker up and running by executing one of the following command:
`docker-compose up`
`docker-compose up -d`

## Lint check

Improve code with lint check first before submit any merge request

1. Install dependencies
2. Execute command
`npm run lint`
3. Fix lint by updating code

## Unit test

This project using Jest for the test framework, to setup your local test environment follow the following steps:

1. Install dependencies
2. Inside `./src/test/` folder you should see .`test.env.example` file, copy it to `.test.env`
3. Inside project root directory, run command
`npm run test`

Note: The test case result must be passed with testing coverage mark of 80%  or higher

- intro java
- intro of oop
- 
# api-graphql-mobile-product-weare-one
