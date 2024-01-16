import type { EdgeStyle, Rect } from "./style/NodeGraphic"

export type Node<NodeSymbol=any> = {
    id:string,
    x:number,
    y:number,
    fixed:boolean
    symbol:NodeSymbol
    data:any
}

export type Edge<NodeStyle=Rect> ={
    souce:string,
    target:string,
    sourceNode:Node<NodeStyle>,
    targetNode:Node<NodeStyle>,
    style:EdgeStyle
    /**
     * ignore=true时边不参与链接力的计算
     */
    ignore:boolean
    data:any
}