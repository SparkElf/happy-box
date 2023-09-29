import {
    Controller,
    Get,
    Param,
    Post,
    Body,
    Put,
    Delete,
    Query,
    ParseIntPipe,
} from '@nestjs/common';
import { UserService } from '@/user/UserService';
import { User } from '@prisma/client';
import { JwtAuthGuard } from '@/auth/AuthGuard';
import { UseGuards } from '@/auth/AuthGuard';
import type { UserDTO } from '@/types/User';

@Controller('user')
export class UserController {
    constructor(
        private readonly userService: UserService,
    ) { }
    @UseGuards(JwtAuthGuard)
    @Get(':id')
    async getUserById(
        @Param('id', ParseIntPipe) id: number
    ): Promise<UserDTO | null> {
        const { password, ...result } = await this.userService.repo.findUnique({
            where: {
                id
            },
        })
        return result
    }

    @Get()
    async getUsers(
        @Body() searchValue: UserDTO
    ) {
        return this.userService.repo.findMany({
            where: searchValue
        })
    }
    @Post()
    async createUser(
        @Body() user: User,
    ): Promise<UserDTO> {
        return this.userService.repo.create({ data: user });
    }
    @Put()
    async updateUser(
        @Body() user: UserDTO,
    ): Promise<UserDTO> {
        return this.userService.repo.update({
            where: {
                id: user.id
            },
            data: user
        });
    }
    @Delete()
    async deleteUser(
        @Param() id: number
    ): Promise<UserDTO> {
        return this.userService.repo.delete({
            where: {
                id
            }
        })
    }
}