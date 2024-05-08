import { ref, shallowRef, type Ref } from "vue";
import type { GraphEdge, GraphNode } from "./Base";
import { watch } from "vue";

export function useGraph(originNodes:Ref<GraphNode[]>,originEdges:Ref<GraphEdge[]>){
    const nodes = shallowRef<GraphNode[]>(originNodes.value);
    const edges = shallowRef<GraphEdge[]>(originEdges.value);
    const nodeMap = new Map<string, GraphNode>();

    function handle(){
        nodeMap.clear();
        nodes.value.forEach(node => nodeMap.set(node.id, node));
        const filteredEdges = [] as GraphEdge[];
        edges.value.forEach(e=>{
            const sourceNode=nodeMap.get(e.source)
            const targetNode=nodeMap.get(e.target)
            if(sourceNode&&targetNode){
                e.sourceNode=sourceNode as any
                e.targetNode=targetNode as any
                filteredEdges.push(e)
            }
        })
        edges.value=filteredEdges
    }
    watch(originNodes,handle)
    watch(originEdges,handle)
    handle()
    return {nodes,edges}
}
export function useLegendGraph(originNodes:Ref<GraphNode[]>,originEdges:Ref<GraphEdge[]>,initSelectedLegends?:number[]){
    const {nodes:graphNode,edges:graphEdge} = useGraph(originNodes,originEdges)
    const nodes = shallowRef<GraphNode[]>(graphNode.value);
    const edges = shallowRef<GraphEdge[]>(graphEdge.value)
    const selectedLegends=ref<number[]>(initSelectedLegends||[])

    watch(selectedLegends,updateLegend)
    watch(originNodes,updateLegend)
    watch(originEdges,updateLegend)
    function updateLegend(){
        console.log('update legend')
        const s=new Set(selectedLegends.value)
        nodes.value=graphNode.value.filter(n=>s.has(n.category))
        edges.value=graphEdge.value.filter(e=>s.has(e.sourceNode.category)&&s.has(e.targetNode.category))
    }
    updateLegend()
    return {nodes,edges,selectedLegends}
}