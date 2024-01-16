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
                    color: 'source',
                    curveness: 0.05
                },
                // autoCurveness:true,
                selectedMode: 'multiple',
                select: {
                    itemStyle: {
                        shadowColor: "#fff",
                        shadowBlur: 10
                    }
                },
                //legendHoverLink: true,
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

    const d3nodes = graphData.value.nodes //graphData.value.nodes.map(node => ({ ...node }))//
    const d3edges = graphData.value.edges.map(edge => ({ ...edge }))
    console.log(d3nodes,d3edges)
    let simulation = d3.forceSimulation(d3nodes)
        .force("link", d3.forceLink(d3edges).id((node, i) => node.id).distance(1))//distance极大影响布局效果，默认30，越小聚类效果越好
        .force("charge", d3.forceManyBody().strength(-1))
        //.force("charge", d3.forceManyBody().strength(0.1))
        .force("collide", d3.forceCollide().radius((node, i) => node.symbolSize! / 16))
        .force("x", d3.forceX())
        .force("y", d3.forceY())
        //.force('radius',d3.forceRadial(Math.min(width,height),width/2,height/2).strength(-0.1))
        //.force("center", d3.forceCenter(width / 2, height / 2))//中心力，设置之后，当画布移动后再模拟时，graph会平移
        .on('tick', () => {
            //updateNodes(chart, graphData.value.nodes)

        })
        .on('end', () => {
            //console.log(graphData, 'simulation end')
            chart.value?.hideLoading()
            updateNodes(chart, graphData.value.nodes)
        })
        .alphaDecay(0.05)
        .velocityDecay(0.1)
    chart.value.showLoading()
    let dragging = false
    let dataIndex: number
    let simulating = false
    chart.value.on('mousedown', (e) => {
        console.log('mouse down', e)
        if (e.dataType !== 'node') return
        dragging = true
        dataIndex = e.dataIndex
        simulation.stop()
        simulation.alphaTarget(0.8).restart()
    })
    chart.value.getZr().on('mousemove', (e) => {
        //console.log(e,graphData.value.nodes[0].vx)
        if (!dragging) return
        //simulation.tick()
        
        const [x, y] = chart.value?.convertFromPixel({ seriesIndex: 0 }, [e.offsetX, e.offsetY]) as number[]
        const node = graphData.value.nodes[dataIndex]
        node.x = x
        node.y = y
        updateNodes(chart, graphData.value.nodes)
    })
    chart.value.getZr().on('mouseup', (e) => {
        console.log('mouse up')
        dragging = false
        simulation.alphaTarget(0)
    })
    chart.value.on('legendselectchanged', params => {
        console.log(params)
        requestAnimationFrame(() => {
            //chart.value?.showLoading()
            const nodes = graphData.value.nodes.filter(node => (params as any).selected[graphData.value.categories[node.category as number].name] !== false)
            graphData.value.nodes.forEach(node=>{
                node.vx=undefined
                node.vy=undefined
                node.index=undefined
            })
            console.log(nodes)
            updateNodes(chart, nodes)
            const nodeSet = new Set<string>()
            nodes.forEach(node => nodeSet.add(node.id))
            const edges = graphData.value.edges.filter(edge => nodeSet.has(edge.source) && nodeSet.has(edge.target))
            simulation.restart()
            simulation = d3.forceSimulation(nodes)
                .force("link", d3.forceLink(edges).id((node, i) => node.id).distance(1))//distance越大越紧凑
                .force("charge", d3.forceManyBody().strength(-1))
                //.force("charge", d3.forceManyBody().strength(1))
                .force("collide", d3.forceCollide().radius((node, i) => node.symbolSize! / 16))
                .force("x", d3.forceX())
                .force("y", d3.forceY())
                //.force('radius',d3.forceRadial(Math.min(width,height),width/2,height/2).strength(-0.1))
                //.force("center", d3.forceCenter(width / 2, height / 2))//中心力，设置之后，当画布移动后再模拟时，graph会平移
                .on('tick', () => {
                    updateNodes(chart, nodes)
                })
                .on('end', () => {
                    //console.log(graphData, 'simulation end')
                    updateNodes(chart, nodes)
                    chart.value?.hideLoading()

                })
                //.alphaDecay(0.01)
                .velocityDecay(0.1)
        });
    })

})

</script>
<style lang="scss">
.container {
    min-width: 800px;
    min-height: 600px;
}
</style>