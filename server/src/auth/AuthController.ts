import {
    Controller,
    Get,
    Param,
    Post,
    Body,
    Put,
    Delete,
    Query,
    Request,
} from '@nestjs/common';
import { AuthService } from '@/auth/AuthService';
import { AuthGuard } from '@nestjs/passport';
import { LocalAuthGuard, UseGuards } from './AuthGuard';
import { User } from '@prisma/client';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
    ) { }
    @UseGuards(LocalAuthGuard)
    @Post('login')
    async login(@Request() req) {
        return  req.jwt //由passport的LocalStratagy策略填充
    }
    @Post('signup')
    async signup(@Body()user:Omit<User,'id'>) {
        return this.authService.signup(user)//由passport的LocalStratagy策略填充
    }
}