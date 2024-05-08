import type { EventCenter } from "@/lib/xchart/event";
import type { GraphEdge, GraphNode } from "../../Base";

export abstract class Force<NodeType extends GraphNode = GraphNode<any>> {
    abstract ctx:ForceContext<NodeType>
    abstract force(alpha:number,args?:any): void
    abstract init(ctx:ForceContext<NodeType>):void
}
export type ForceContext<NodeType extends GraphNode = GraphNode<any>> = {
    eventCenter:EventCenter
    nodes: NodeType[]
    edges: GraphEdge<NodeType>[]
}

//在 D3.js 中，"jiggle" 通常用于表示对数据进行微小的随机扰动或摆动，以避免在进行力导向布局等操作时出现重叠的情况。这种微小的随机性可以帮助分散节点的位置，使得它们更容易被布局在合适的位置上，从而改善可视化效果。
export function jiggle() {
    return (Math.random() - 0.5) * 1e-6;
}
