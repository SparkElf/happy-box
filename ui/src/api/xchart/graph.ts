import {request} from "./request"

export function getLevelGraphByIdcard(idcard:string,level:number){
    return request({
        url: '/getLevelGraphByIdcard',
        method: 'get',
        params:{idcard,level}
    })
}
export function getLevelGraphByShopId(shopId:string,level:number){
    return request({
        url: '/getLevelGraphByShopId',
        method: 'get',
        params:{shopId,level}
    })
}