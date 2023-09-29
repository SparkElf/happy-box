import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/PrismaService';
import { User, Prisma } from '@prisma/client';

@Injectable()
export class UserService {
  public repo:ConstructorParameters<typeof UserService>[0]['user']
  constructor(
    private prisma: PrismaService
    ) {
      this.repo=prisma.user//构造函数中的选项都会被依赖注入扫描
    }
  //Service层应该写一些事务代码或者业务代码，不要写样本代码，Service层不是Orm的简单套壳
}