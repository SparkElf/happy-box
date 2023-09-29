import {Strategy as PassPortLocalStrategy } from 'passport-local';
import { AuthGuard as PassportAuthGuard, PassportStrategy } from '@nestjs/passport';

import { ExtractJwt, Strategy as PassPortJwtStrategy } from 'passport-jwt';
import { CanActivate, ExecutionContext, Injectable, SetMetadata, UnauthorizedException, applyDecorators } from '@nestjs/common';
import { AuthService } from './AuthService';

import { Reflector } from '@nestjs/core';
import {AnyFn, PermissionFn} from '@/types/Auth'
import { bold, logger } from '@/utils/logger';
import { UseGuards as NestJSUseGuards } from '@nestjs/common';
@Injectable()
export class LocalStrategy extends PassportStrategy(PassPortLocalStrategy) {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(username: string, password: string): Promise<any> {
    const resp = await this.authService.login(username, password);
    if (!resp) {
      throw new UnauthorizedException();
    }
    return resp;
  }
}
@Injectable()
export class LocalAuthGuard extends PassportAuthGuard('local') {}

@Injectable()
export class JwtStrategy extends PassportStrategy(PassPortJwtStrategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload:any): Promise<any> {
    return payload
  }
}

@Injectable()
export class JwtAuthGuard extends PassportAuthGuard('jwt') {}



@Injectable()
export  class PreGuard implements CanActivate{
  constructor(private reflector: Reflector) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req=context.switchToHttp().getRequest()
    const reqUrl=bold("Request Url: ")+req.url
    const jwt = bold("JWT Token: ") + (req.headers['Authorization']?req.headers['Authorization']:req.headers['authorization'])
    logger.multiLineInfo({ msg: [reqUrl,jwt], tag: "NestJS", title: "NestJS Auth info:" })
    return true
  }
}

export function UseGuards(...args:Parameters<typeof NestJSUseGuards>){
  return applyDecorators(
   NestJSUseGuards(PreGuard,...args)
  )
}

export function Permissions(...permissionFns:PermissionFn[]){
  return SetMetadata('permissionFns',permissionFns)
}

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>("isPublic", [
      context.getHandler(),
      context.getClass(),
    ]);
    const permissionFn=this.reflector.getAllAndOverride<AnyFn[]>("permissionFn", [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic||!permissionFn) {
      return true;
    }

    return permissionFn.every(fn=>fn(context));
  }
}

