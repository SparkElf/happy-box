import { GraphSeriesOption } from "echarts"
import { ToTuple } from "type"
declare type DataType =T extends {name:string}?T:never
declare type Neo4jServerDataItem={
    startNode:{
        id:string
        data:DataType
        labels:string[]
    },
    endNode:{
        id:string
        data:DataType
        labels:string[]
    },
    relationships:{
        id:string
        data:any
        labels:string[]
        startNodeId:string
        endNodeId:string
    }
}
declare type Neo4jServerData=Neo4jServerDataItem[]

declare type RelationshipGraphNode=(ToTuple< Exclude<GraphSeriesOption['nodes'],undefined>[number]> [0]) &{data:DataType}

declare type RelationshipEdge=Exclude<GraphSeriesOption['edges'],undefined>[number]&{data:any}
declare type RelationshipGraphData={
    categories:string[],
    nodes:RelationshipGraphNode[],
    edges:RelationshipEdge[]
}

declare type RelationshipNodeData={
    name:string
    data:any
    category:string
}