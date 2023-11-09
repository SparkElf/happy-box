import { GraphSeriesOption } from "echarts"
import { ToTuple } from "type"


declare type Neo4jServerData = {
    nodes:{
        id:string
        name:string
        data:string
        labels?:string[]
    }[],
    edges: {
        id: string
        name:string
        data: any
        labels?: string[]
        source: string
        target: string
    }[],
    categories:RelationshipGraphCategory[]
}


declare type RelationshipEdge = {
    /**
    * Name or index of source node.
    */
    source: string;
    /**
     * Name or index of target node.
     */
    target: string;
    /**
     * 额外的信息字段
     */
    data:any

    labels?:string[]
}

declare type RelationshipNode = {
    /**
     * id，用于引用节点
     */
    id: string;
    /**
     * 作为节点的默认label展示
     */
    name: string;
    value?: number;
    /**
     * Fixed x position
     */
    x?: number;
    /**
     * Fixed y position
     */
    y?: number;
    /**
     * If this node is fixed during force layout.
     */
    fixed?: boolean;
    /**
     * Index or name of category
     */
    category?: string;
    draggable?: boolean;
    cursor?: string;
    /**
     * 附加信息
     */
    data:any
    labels?:string[]
    symbolSize?:number
}
declare type RelationshipGraphCategory={
    name:string
}
declare type RelationshipGraph = {
    nodeMap: Map<string, RelationshipNode>
    edgeMap:Map<string,RelationshipEdge>
    nodes:RelationshipNode[]
    edges:RelationshipEdge[]
    categories:RelationshipGraphCategory[]
}

declare type RelationshipNext= Map<string, RelationshipEdge[]>