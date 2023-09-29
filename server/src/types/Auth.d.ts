import { User } from "@prisma/client"
import {ExecutionContext} from '@nestjs/common'
export  type AnyFn=(...args: any)=>any
export  type Fn<T> = T extends AnyFn?T:never
export  type PermissionFn = (context:ExecutionContext)=>boolean
export  type LoginResponse={
    accessToken:string,
    user:{
    userId:number
    userName:string
}&Omit<User,'password'|'id'|'username'>}

export  type SignupResponse={
    userId:number
    userName:string
}&Omit<User,'password'|'id'|'username'>