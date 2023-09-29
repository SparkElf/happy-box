import { prismaLogger } from '@/utils/logger';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient<Prisma.PrismaClientOptions, 'query'|'info'> implements OnModuleInit {
  constructor() {
    super({
      log: [{
        level: 'query',
        emit: 'event',
      }, {
        level:'info',
        emit:'event'
      }, 'warn', 'error']
    });
    this.$on('query', (e) => {
      prismaLogger.query(e)
    })
    this.$on('info',(e)=>{
      prismaLogger.info(e)
    })
  }
  async onModuleInit() {
    //prisma执行第一个查询时自动创建连接池和连接

    //await this.$connect();
  }
}
