import { MiddlewareConsumer, Module, ModuleMetadata, NestModule } from '@nestjs/common';
import { AppController } from './AppController';
import { AppService } from './AppService';
import { PrismaService } from '@/prisma/PrismaService'
import { UserService } from './user/UserService';
import { PostService } from './post/PostService';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy, LocalStrategy } from './auth/AuthGuard';
import { AuthService } from './auth/AuthService';
import { UserModule } from './user/UserModule';
import { PrismaModule } from './prisma/PrismaModule';
import { AuthModule } from './auth/AuthModel';
import { NestJSLoggerMiddleware, logger } from './utils/logger';

console.log(process.env.JWT_SECRET,'JWT_SECRET')
export const AppModuleMeta:ModuleMetadata = {
  imports: [
      PrismaModule,
      UserModule,
      AuthModule,
    ],
  controllers: [AppController],
  providers: [ PostService,AppService],
}
@Module(AppModuleMeta)
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply( NestJSLoggerMiddleware)
      .forRoutes("*");
  }
}
