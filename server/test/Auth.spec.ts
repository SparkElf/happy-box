import { Test } from '@nestjs/testing';
import { AppModuleMeta } from '@/AppModule';
import { PrismaService } from '../src/prisma/PrismaService';
import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { User } from '@prisma/client';
import {getAllRoutes} from '@/utils/test'
import { MockPrisma } from '@/prisma/PrismaMock';
import { BaseLogger, NestJSLogInterceptor, NestJSLoggerMiddlewareFn, PrismaLogger } from '@/utils/logger';
import { config } from 'dotenv';
describe('auth', async() => {
  let app:INestApplication

  let mockPrisma=new MockPrisma({
    PrismaClientFactory:()=>new PrismaService()
  })
  const mockPrismaClient=await mockPrisma.init()
  global.prismaLogger=new PrismaLogger(new BaseLogger)
  config()
  //console.log(process.env)
  beforeEach(async () => {
    await mockPrisma.beginTransaction()//模块初始化前把实例生成好，否则service中的prisma实例已经被注入
    //do connect on app init
    const moduleFixture= await Test
    .createTestingModule(AppModuleMeta)
    .overrideProvider(PrismaService)
    .useValue(mockPrismaClient)
    .compile();
    app= moduleFixture.createNestApplication()
    app.useGlobalInterceptors(new NestJSLogInterceptor())
    await app.init()
  });
  afterAll(async () => {
    mockPrisma.finishTransaction()
    await mockPrisma.originalClient.$disconnect()
    await app.close();
  });
  it('signup and login', async() => {
    console.log(getAllRoutes(app))
    let res=await request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        password:'123456',
        username:'aaa'
      }as Omit<User,'id'>)

    const{userId}=res.body
    res=await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        password:'123456',
        username:'aaa'
      }as Omit<User,'id'>)

    const {accessToken}=res.body
    res=await request(app.getHttpServer())
    .get('/user/'+userId)

    res=await request(app.getHttpServer())
    .get('/user/'+userId)
    .set('Authorization',"Bearer "+accessToken)

    return true
  });
});
