import { Global, Module } from '@nestjs/common';
import { AuthService } from '@/auth/AuthService'
import { JwtStrategy, LocalStrategy } from './AuthGuard';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './AuthController';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from '@/user/UserModule';


@Module({
  imports: [
    UserModule,
    PassportModule.register(
      {
        property: 'jwt'
      }),
    JwtModule.register({
      global:true,//?全局使用
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '7d' },
    }),],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy],//jwtmodule提供jwtservice，authservice需要jwtservice
  exports: [AuthService]//strategy是Passportmodule的配置项，给PassportModule和JwtModule用的
})
export class AuthModule { }
