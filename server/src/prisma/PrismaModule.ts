import { Global, Module } from '@nestjs/common';
import { PrismaService } from './PrismaService';

export const PrismaModuleMetaData={
  imports: [],
  controllers:[],
  providers: [PrismaService],
  exports:[PrismaService]
}
@Global()//全局模块
@Module(PrismaModuleMetaData)
export class PrismaModule {}
