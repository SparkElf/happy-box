import { Injectable } from '@nestjs/common';
import { UserService } from '@/user/UserService';
import { User } from '@prisma/client';
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { LoginResponse, SignupResponse } from '@/types/Auth';

@Injectable()
export class AuthService {

  constructor(
    private userService:UserService,
    private jwtService:JwtService
    ) {}
  //Service层应该写一些事务代码或者业务代码，不要写样本代码，Service层不是Orm的简单套壳
  /**
   * 根据用户名和密码认证，登录成功返回用户信息
   * @param username
   * @param password
   */
  async login(username: string, password: string): Promise<LoginResponse> {
    const user = await this.userService.repo.findUnique({
      where:{username}
    })
    if (user && await bcrypt.compare(password,user.password)) {

      const { password, id:userId,username:userName,...result } = user;

      return {
        accessToken: await this.jwtService.signAsync({sub:userId,userId,userName}),//sub不能少，签名的抗抵赖要配合身份标识符使用
        user:{
          userId,
          userName,
          ...result
        }
      };
    }
    return null;
  }

  async signup(user:Omit<User,'id'>): Promise<SignupResponse> {
    user.password=await bcrypt.hash(user.password,10)
    const {password,id:userId,username:userName,...result}=await this.userService.repo.create({
      data:user
    })

    return {
      userId,
      userName,
      ...result
    };
  }
}

