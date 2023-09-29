import type {PermissionFn}from '@/types/Auth'


export const  requireRoles:(requireRoles:string[])=>PermissionFn=(requireRoles:string[] )=> {

    return function(context){
        //从token中获取userId
        const payload=context.switchToHttp().getRequest().jwtToken
        console.log(payload)
        //用userId从数据库中获取roles
        //验证requireRoles in roles
        return true
    }
}