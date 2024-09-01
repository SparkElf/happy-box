import type { LegendProp } from "@/lib/xchart/legend/type"
import {request} from "./request"
import type {GraphNode, GraphEdge } from "@/lib/xchart/chart/graph/Base"

export type GraphResponse={
    category: LegendProp
    nodes:GraphNode[]
    edges:GraphEdge[]
}
export type LevelGraphResponse={
    outOfBound:boolean
    graph?:GraphResponse
}
export function getLevelGraphByIdcardApi(idcard:string,level:number){
    return request<'single',LevelGraphResponse>({
        url: '/getLevelGraphByIdcard',
        method: 'get',
        params:{idcard,level}
    })
}
export function getLevelGraphByShopIdApi(shopId:string,level:number){
    return request<'single',LevelGraphResponse>({
        url: '/getLevelGraphByShopId',
        method: 'get',
        params:{shopId,level}
    })
}