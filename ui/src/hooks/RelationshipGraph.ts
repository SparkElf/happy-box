import type { Neo4jServerData, RelationshipNode, RelationshipEdge, RelationshipGraph } from "@/components/RelationshipGraph/type";
import type { EChartsOption, EChartsType } from "echarts";

import { watch, type Ref, type ShallowRef, ref, computed } from "vue";

export function useGraph({
    sourceData,
}: {
    sourceData: Ref<Neo4jServerData | undefined>
}) {
    //neo4j->echarts id->name label->category name->label
    const graph = ref<RelationshipGraph>({
        categories: [],
        nodeMap: new Map(),
        edgeMap: new Map(),
        nodes: [],
        edges: []
    })

    watch(sourceData, () => {
        let res: RelationshipGraph = {
            categories: [],
            nodeMap: new Map(),
            edgeMap: new Map(),
            nodes: [],
            edges: []
        }
        graph.value = res
        if (!sourceData.value) return

        sourceData.value.nodes.forEach(node => {
            res.nodeMap.set(node.id, node)
            res.nodes.push(node)
        })
        sourceData.value.edges.forEach(edge => {
            res.edgeMap.set(edge.id, edge)
            res.edges.push(edge)
        })

        res.categories = sourceData.value.categories
        graph.value =res
    })

    return graph
}

export const useNext = (graph: ShallowRef<RelationshipGraph | undefined>) => {
    const next = ref(new Map<string, RelationshipEdge[]>)
    watch(graph, () => {
        if (graph.value == null) return
        graph.value.nodes.forEach((node) => {
            next.value.set(node.id!, [])
        })
        graph.value.edges.forEach((edge) => {
            next.value.get(edge.source as string)!.push(edge)
        })
    })

    return next
}

export const useCollapse = (graphData: ShallowRef<RelationshipGraph>) => {

}

export const useDragFixed = (graphData: ShallowRef<RelationshipGraph>, chart: ShallowRef<EChartsType | undefined>) => {
    watch(chart, (oldv, newv) => {
        if (chart.value == null) return
        chart.value.on('mouseup', (params) => {
            console.log(params, graphData.value)
            if (params.dataType === 'node' && graphData.value && chart.value) {
                graphData.value.nodes[params.dataIndex].fixed = true
                graphData.value.nodes[params.dataIndex].x = params.event?.offsetX
                graphData.value.nodes[params.dataIndex].y = params.event?.offsetY
                let option: EChartsOption = {
                    series: {
                        nodes: graphData.value.nodes
                    }
                }
                chart.value?.setOption(option)
            }
        })
    })
}

export const useRightClickMenu = (graphData: Ref<RelationshipGraph>, chart: ShallowRef<EChartsType | undefined>) => {
    watch(chart, (oldv, newv) => {
        if (chart.value == null) return
        chart.value.on('contextmenu', (e) => {
            console.log(e, 'contextmenu')
        })
        chart.value.getZr().on('contextmenu', (e,) => {
            console.log(e, e.target, e.type)
        })
    })
}