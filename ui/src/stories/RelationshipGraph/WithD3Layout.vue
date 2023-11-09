<template>
    <div class="container" ref="container$" @contextmenu.prevent>

    </div>
</template>
<script setup lang="ts">


import { type EChartsOption, init, type EChartsType } from 'echarts';
import { onMounted, watch } from 'vue';
import { ref } from 'vue';

import type { Neo4jServerData, RelationshipNode } from '@/components/RelationshipGraph/type';
import { shallowRef } from "vue";
import { useDragFixed, useGraph, useRightClickMenu } from "@/hooks/RelationshipGraph";
import { forceSimulation, forceLink, forceManyBody, forceX, forceY, forceCenter, forceCollide, } from 'd3';

const container$ = ref<HTMLElement>();
const sourceData = shallowRef<Neo4jServerData>()
const graphData = useGraph({
    sourceData
})

const chart = shallowRef<EChartsType>()

//useDragFixed(graphData,chart)
//useRightClickMenu(graphData,chart)
onMounted(async () => {
    let chartDom = container$.value;
    chart.value = init(chartDom!, 'dark', {
        renderer: 'canvas',
        useDirtyRect: true
    });
    chart.value.showLoading();
    sourceData.value = (await import('@/assets/json/RelationshipGraph/data.json')).default as any
    chart.value.hideLoading();
})
watch(graphData, () => {

    if (!graphData.value || !chart.value) return
    console.log(graphData.value, 'graphData')
    const d3nodes = graphData.value.nodes.map(node => ({ ...node }))
    const d3edges = graphData.value.edges.map(edge => ({ ...edge }))

    const simulation = forceSimulation(d3nodes)
        .force("link", forceLink(d3edges).id((node, i) => graphData.value.nodes[i].id).distance(0))
        .force("charge", forceManyBody().strength(-1))
         .force("collide", forceCollide().radius((node,i) => graphData.value.nodes[i].symbolSize!/256))
        .force("x", forceX())
        .force("y", forceY())

        .alphaDecay(0.0025);

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
                layout: 'none',
                categories: graphData.value.categories,
                symbolSize: 30,
                draggable: true,
                edgeSymbol: ['none', 'arrow'],
                nodes: graphData.value.nodes,
                edges: graphData.value.edges,
                force: {
                    edgeLength: [100, 50],
                    repulsion: 500,
                    gravity: 0.2,
                    initLayout: 'circular',
                    //layoutAnimation:false
                },
                animation:false,
                labelLayout: {
                    hideOverlap: true
                },
                // itemStyle: {
                //   borderWidth: 1,
                //   borderType: 'solid',
                //   borderColor: '#000000'
                // },
                roam: true,
                label: {
                    show: true,
                    position: 'right',
                    formatter: '{b}'
                },
                lineStyle: {
                    color: 'target',
                    curveness: 0.1
                },
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
    chart.value!.setOption(option);
    console.log('graph init', option)
    simulation.on("tick", () => {
        simulation.nodes().forEach((node, index) => {
            graphData.value.nodes[index].x = node.x!
            graphData.value.nodes[index].y = node.y!
        })
        chart.value!.setOption({
            series: [
                {
                    nodes: graphData.value.nodes,
                    edges: graphData.value.edges
                }
            ]
        } as EChartsOption)
    })
})


</script>
<style lang="scss">
.container {
    width: 100%;
    height: 100%;
    min-width: 800px;
    min-height: 600px;
    //background-color: rgba($color: #000000, $alpha: .1);
}
</style>