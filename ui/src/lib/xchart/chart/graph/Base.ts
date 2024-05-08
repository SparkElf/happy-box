import type { Graphics, Sprite } from "pixi.js"
import type { ChartContext } from "../../Base"
import type { ITexture } from "../../texture/basic"


export type GraphNode<NodeTextureProps=any> = {
    id:string
    index:number
    x:number
    y:number
    vx:number
    vy:number
    fx:number
    fy:number
    fixed:boolean
    xTexture?:ITexture<NodeTextureProps>//避免和pixi的texture冲突
    data:any
    category:number//TODO:支持直接传string
}&Sprite

export type GraphEdge<NodeType extends GraphNode = GraphNode> ={
    id:string
    index:number
    source:string
    target:string
    sourceNode:NodeType
    targetNode:NodeType
    /**
     * ignore=true时边不参与链接力的计算
     */
    ignore:boolean
    data:any
}&Graphics

export type GraphChartContext<NodeType extends GraphNode = GraphNode > = ChartContext&{
    nodes:NodeType[],
    edges:GraphEdge<NodeType>[]
}