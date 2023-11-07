import {type GraphSeriesOption}from 'echarts'
import { computed, type Ref } from "vue";
import type { RelationshipGraphData, Neo4jServerData, RelationshipGraphNode } from "./type";

export function useNeo4jData({
    sourceData,
}:{
    sourceData:Ref<Neo4jServerData|undefined>
}){
    //neo4j->echarts id->name label->category name->label
    const graphData=computed<RelationshipGraphData>(()=>{

        let res:RelationshipGraphData={
            categories:[],
            nodes:[],
            edges:[]
        }
        if(!sourceData.value)return res
        const categorySet=new Set<string>()
        const nodesSet=new Map<string,RelationshipGraphNode >()

        for(let i=0;i<sourceData.value.length;i++){
            const cur=sourceData.value[i]
            cur.startNode.labels.forEach(label=>categorySet.add(label))
            cur.endNode.labels.forEach(label=>categorySet.add(label))
            const startNodeName=cur.startNode.id.toString()
            const endNodeName=cur.endNode.id.toString()
            nodesSet.set(startNodeName,{name:startNodeName,data:cur.startNode,category:cur.startNode.labels[0]})
            nodesSet.set(endNodeName,{name:endNodeName,data:cur.endNode,category:cur.endNode.labels[0]})
            res.edges!.push({source:cur.startNode.id.toString(),target:cur.endNode.id.toString(),data:cur.relationships})
        }
        res.categories=Array.from(categorySet)
        res.nodes=Array.from(nodesSet.values())
        return res
    })
    return graphData
}