import type { Neo4jServerData, RelationshipNode, RelationshipEdge, RelationshipGraph, RelationshipDragCallback } from "@/components/RelationshipGraph/type";
import type { ECElementEvent, EChartsOption, EChartsType } from "echarts";
import { shallowRef } from "vue";

import { watch, type Ref, type ShallowRef, ref, computed } from "vue";

export function useEchartsGraph({
    sourceData,
}: {
    sourceData: Ref<Neo4jServerData | undefined>
}) {
    //neo4j->echarts id->name label->category name->label
    const graph = shallowRef<RelationshipGraph>({
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
        graph.value = res
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


export const useEchartsDrag = (chart: ShallowRef<EChartsType | undefined>) => {
    let x: number | undefined
    let y: number | undefined
    let dataType:string|undefined
    const callbacks = ref<{dataType:string|undefined,callback:RelationshipDragCallback}[]>([])

    watch(chart, async () => {
        if (chart.value == null) return
        console.log('done', chart.value == null)
        chart.value?.on('mousedown', (e) => {
            console.log('mouse down drag', e)
            x = e.event!.offsetX
            y = e.event!.offsetY
            dataType=e.dataType
        })
        chart.value?.on('mousemove', e => {
            //console.log(x, y, 'move')
            if (x === undefined || y === undefined) return
            console.log('mouse move drag',e.offsetX,e.offsetY)
            callbacks.value.forEach(item => {
                console.log('item',item.dataType,dataType)
                if(item.dataType===dataType&&item.dataType===e.dataType)
                    item.callback(e.event!.offsetX - x!, e.event!.offsetY - y!, e)
            })
            x = e.event!.offsetX
            y = e.event!.offsetY
        })
        chart.value?.on('mouseup', (e) => {
            console.log('mouse up drag')
            x = undefined
            y = undefined
            dataType=undefined
        })
    })

    return {onEchartDrag:(dataType:string|undefined,callback: RelationshipDragCallback) => { callbacks.value.push({
        dataType,
        callback
    }) }}
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

export const clearEchartEvent = (chart: ShallowRef<EChartsType | undefined>) => {
    if (chart.value == null) return
    const eventList = ['click', 'dbclick', 'contextmenu', 'mouseup', 'mousedown', 'mouseover', 'mousemove', 'globalout']
    eventList.forEach(e => chart.value?.off(e))

}
export const updateGraph = (chart: ShallowRef<EChartsType | undefined>,graphData:Ref<RelationshipGraph>) => {
    if (chart.value == null) return
    chart.value.setOption({
        series:[{
            nodes:graphData.value.nodes,
            edges:graphData.value.edges
        }]
    } as EChartsOption,false,true)

}
export const updateNodes = (chart: ShallowRef<EChartsType | undefined>,nodes:RelationshipNode[]) => {
    if (chart.value == null) return
    chart.value.setOption({
        series:[{
            nodes:nodes
        }]
    } as EChartsOption,false,true)

}
export const updateEdges = (chart: ShallowRef<EChartsType | undefined>,edges:RelationshipEdge[]) => {
    if (chart.value == null) return
    chart.value.setOption({
        series:[{
            edges:edges
        }]
    } as EChartsOption,false,true)

}
export const refresh=(chart: ShallowRef<EChartsType | undefined>)=>{
    if (chart.value == null) return
    chart.value.getZr().refreshImmediately(true)
    //chart.value.setOption(null as EChartsOption)
    //chart.value.resize({width:800+Math.random()/100})
}

export const toEchartsGraph=({
    sourceData,
}: {
    sourceData: Ref<Neo4jServerData | undefined>
})=>{
    
}

export const toG6Graph=({
    sourceData,
}: {
    sourceData: Ref<Neo4jServerData | undefined>
})=>{

}

export const toD3Graph=({
    sourceData,
}: {
    sourceData: Ref<Neo4jServerData | undefined>
})=>{

}