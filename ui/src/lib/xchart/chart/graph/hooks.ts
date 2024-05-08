import { ref, shallowRef, type Ref } from "vue";
import type { GraphEdge, GraphNode } from "./Base";
import { watch } from "vue";

export function useLegend(originNodes:Ref<GraphNode[]>,originEdges:Ref<GraphEdge[]>){
    const nodes = shallowRef<GraphNode[]>(originNodes.value);
    const edges = shallowRef<GraphEdge[]>(originEdges.value);
    const selectedLegends=ref<number[]>([])

    watch(selectedLegends,updateLegend)
    watch(originNodes,updateLegend)
    watch(originEdges,updateLegend)
    function updateLegend(){
        const s=new Set(selectedLegends.value)
        nodes.value=originNodes.value.filter(n=>s.has(n.category))
        edges.value=originEdges.value.filter(e=>s.has(e.sourceNode.category)&&s.has(e.targetNode.category))
    }
    return {nodes,edges,selectedLegends}
}