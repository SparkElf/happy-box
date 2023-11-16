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
import { updateGraph, updateNodes, useEchartsDrag, useEchartsGraph, useRightClickMenu } from "@/hooks/RelationshipGraph";
import * as d3 from 'd3';

const container$ = ref<HTMLElement>();
const sourceData = shallowRef<Neo4jServerData>()
const graphData = useEchartsGraph({
    sourceData
})

const chart = shallowRef<EChartsType>()
//const {onEchartDrag} = useEchartsDrag(chart)

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
    const width = 800
    const height = 600
    if (!graphData.value || !chart.value) return

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
                //edgeSymbol: ['none', 'arrow'],
                nodes: graphData.value.nodes,
                edges: graphData.value.edges,
                force: {
                    edgeLength: [100, 50],
                    repulsion: 500,
                    gravity: 0.2,
                    initLayout: 'circular',
                    //layoutAnimation:false
                },
                animation: false,
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
                    //show: true,
                    position: 'right',
                    formatter: '{b}'
                },
                lineStyle: {
                    color: 'target',
                    curveness:0.01
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

    const d3nodes = graphData.value.nodes.map(node => ({ ...node }))
    const d3edges = graphData.value.edges.map(edge => ({ ...edge }))

    const simulation = d3.forceSimulation(d3nodes)
        .force("link", d3.forceLink(d3edges).id((node, i) => graphData.value.nodes[i].id).distance(0))//distance极大影响布局效果，默认30，越小聚类效果越好
        .force("charge", d3.forceManyBody().strength(-1))
        .force("collide", d3.forceCollide().radius((node, i) => graphData.value.nodes[i].symbolSize! /20))
        .force("x", d3.forceX())
        .force("y", d3.forceY())//力在哪个方向上起作用，可以附加bias
        .force("center", d3.forceCenter(width / 2, height / 2))//指定画布大小
        .on('tick', () => {

            simulation.nodes().forEach((node, index) => {
                graphData.value.nodes[index].x = node.x!
                graphData.value.nodes[index].y = node.y!
            })
            updateNodes(chart,graphData.value.nodes)

        }) //.alphaDecay(0.01);//越大越快停止
    const canvas = chart.value.getDom().getElementsByTagName('canvas')[0]
    d3.select(canvas)
        .call(d3.drag<HTMLCanvasElement, any>().container(canvas)
            .subject((e) => {
                const [x, y] = chart.value?.convertFromPixel({ seriesIndex: 0 }, d3.pointer(e,canvas)) as number[]
                const subject = simulation.find(x, y,2)
                if (subject === undefined) return
                simulation.stop()

                console.log('subject', e, graphData.value, simulation.find(x, y,2), x, y)

                return subject
            })
            .on('start', (e) => {



                if (!e.active) simulation.alphaTarget(0.5).restart();
                //e.subject.fx = e.subject.x;
                //e.subject.fy = e.subject.y;
                console.log('start drag', e, graphData.value)
            })
            .on('drag', (e) => {
                if (!e.subject) return
                const [x, y] = chart.value?.convertFromPixel({ seriesIndex: 0 }, d3.pointer(e,canvas)) as number[]
                console.log('dragging', e, simulation.nodes(), graphData.value, x, y)

                e.subject.x = x
                e.subject.y = y
                //updateNodes(chart, d3nodes)

            })
            .on('end', (e) => {
                console.log('end drag', e)

                //simulation.stop()
                if (!e.active) simulation.alphaTarget(0);
            }))
    // chart.value.on('mouseup', (e) => {
    //     console.log('mouseup',
    //      e,
    //      chart.value?.convertToPixel({seriesIndex:e.seriesIndex},[e.data.x,e.data.y]),
    //      chart.value?.convertFromPixel({seriesIndex:e.seriesIndex},[e.event?.offsetX,e.event?.offsetY])
    //      )
    //      const [x,y] = chart.value?.convertFromPixel({seriesIndex:e.seriesIndex},[e.event?.offsetX,e.event?.offsetY])as number[]
    //      const node=graphData.value.nodes[e.dataIndex]
    //      node.x=x
    //      node.y=y
    //      chart.value?.setOption({
    //         series:{nodes:graphData.value.nodes}
    //      } as EChartsOption)

    // })



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