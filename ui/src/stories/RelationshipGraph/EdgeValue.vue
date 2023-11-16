<template>
    <div class="container" ref="container$" @contextmenu.prevent>

    </div>
</template>
<script setup lang="ts">


import { type EChartsOption, init, type EChartsType } from 'echarts';
import { onMounted, watch } from 'vue';
import { ref } from 'vue';

import type { Neo4jServerData } from '@/components/RelationshipGraph/type';
import { shallowRef } from "vue";
import { useEchartsGraph, useRightClickMenu } from "@/hooks/RelationshipGraph";

const container$ = ref<HTMLElement>();
const sourceData = shallowRef<Neo4jServerData>()
const graphData = useEchartsGraph({
    sourceData
})

const chart = shallowRef<EChartsType>()
//useDragFixed(graphData,chart)
//useRightClickMenu(graphData,chart)
onMounted(async () => {
    let chartDom = container$.value;
    chart.value = init(chartDom!);
    chart.value.showLoading();
    sourceData.value = (await import('@/assets/json/RelationshipGraph/source.json')).default as any

    console.log(sourceData.value)
    chart.value.hideLoading();
})
watch(() => graphData.value, () => {

    if (!graphData.value || !chart.value) return
    console.log(graphData?.value, 'graphData')

    const neibourCount=new Map<string,number>()
    const nodeMap=graphData.value.nodeMap
    graphData.value?.nodes.forEach(node=>{
        neibourCount.set(node.id,0)
    })
    graphData.value?.edges.forEach(edge=>{
        neibourCount.set(edge.source,neibourCount.get(edge.source)!+1)
        neibourCount.set(edge.target,neibourCount.get(edge.target)!+1)
    })
    graphData.value.edges.forEach(edge=>{
        let sourceSymbolSize=nodeMap.get(edge.source)?.symbolSize
        let targetSymbolSize=nodeMap.get(edge.target)?.symbolSize
        sourceSymbolSize=sourceSymbolSize?sourceSymbolSize:30
        targetSymbolSize=targetSymbolSize?targetSymbolSize:30
        //edge.value=(Math.min(neibourCount.get(edge.source)!,neibourCount.get(edge.target)!))
    })
    let option: EChartsOption = {
        tooltip: {},
        legend: [{
            data: graphData.value.categories
        }],
        backgroundColor: '',//透明
        cursor: 'pointer',
        series: [
            {
                type: 'graph',
                layout: 'force',
                categories: graphData.value.categories.map(category => {
                    return {
                        name: category.name
                    }
                }),

                symbolSize: 30,
                draggable: true,
                // edgeSymbol: ['none', 'arrow'],
                nodes: graphData.value.nodes,
                edges: graphData.value.edges,
                force: {
                    edgeLength: [500,20],
                    //repulsion: [100,250,500,1000,1500,2000,2500],
                    repulsion:5000,
                    gravity: 0.2,
                    initLayout: 'circular',
                    layoutAnimation:false
                },
                animationDurationUpdate:0,
                labelLayout: {
                    hideOverlap: true,
                },
                animation:false,
                // itemStyle: {
                //   borderWidth: 1,
                //   borderType: 'solid',
                //   borderColor: '#000000'
                // },
                roam: true,
                label: {
                    //show: true,
                    position: 'right',
                    formatter: '{b}'
                },
                lineStyle: {
                    color: 'target',
                    //curveness:0.1
                },
                autoCurveness: true,
                selectedMode: 'multiple',
                select: {
                    itemStyle: {
                        shadowColor: "#fff",
                        shadowBlur: 10
                    }
                },
                legendHoverLink: true,
                emphasis: {
                    focus: 'adjacency',
                    scale: 1.5,
                    lineStyle: {
                        width: 5
                    }
                }
            }
        ]
    };
    chart.value.setOption(option);
    console.log('graph init')
})


</script>
<style lang="scss">
.container {
    min-width: 600px;
    min-height: 600px;
    //background-color: rgba($color: #000000, $alpha: .1);
}
</style>