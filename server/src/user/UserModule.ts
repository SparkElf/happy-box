import { Module } from '@nestjs/common';
import { UserController } from './UserController';
import { UserService } from './UserService';
import { PrismaModule } from '@/prisma/PrismaModule';


@Module({
  imports: [],
  controllers:[UserController],
  providers: [UserService],
  exports:[UserService]
})
export class UserModule {}
