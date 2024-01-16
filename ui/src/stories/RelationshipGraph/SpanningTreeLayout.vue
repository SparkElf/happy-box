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

const container$ = ref<HTMLElement>();
const spanningData = shallowRef<Neo4jServerData>()
const fullData = shallowRef<Neo4jServerData>()
const chart = shallowRef<EChartsType>()
//useDragFixed(graphData,chart)
//useRightClickMenu(graphData,chart)
onMounted(async () => {
    let chartDom = container$.value;
    chart.value = init(chartDom!);
    chart.value.showLoading();
    spanningData.value = (await import('@/assets/json/RelationshipGraph/spanning_tree.json')).default as any
    fullData.value = (await import('@/assets/json/RelationshipGraph/relationship_full.json')).default as any
    chart.value.hideLoading();
})
watch([spanningData, fullData], () => {
    const width = 600
    const height = 600
    if (!spanningData.value || !chart.value || !fullData.value) return
    const edgeSet = new Set()
    spanningData.value.edges.forEach(edge => {
        edgeSet.add(edge.identity)
    })
    fullData.value.edges.forEach(edge => {
        //edge.ignoreForceLayout=!edgeSet.has(edge.identity)
    })


    let option: EChartsOption = {
        tooltip: {},
        backgroundColor: '',//透明
        cursor: 'pointer',
        series: [
            {
                type: 'graph',
                layout: 'force',

                symbolSize: 30,
                draggable: true,
                //edgeSymbol: ['none', 'arrow'],
                nodes: fullData.value.nodes,
                edges: fullData.value.edges,
                force: {
                    edgeLength: [100, 50],
                    repulsion: 500,
                    gravity: 0.2,
                    friction: 0.2,
                    initLayout: 'circular',
                    //layoutAnimation:false
                },
                //animationDurationUpdate: 0,//不设置为0，当layoutAnimation为false时缩放时会有异常 https://github.com/apache/echarts/issues/12211
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
    chart.value.setOption(option);

    setTimeout(() => {
        fullData.value.nodes.forEach(node => {
            node.name = node.labels![0]
            if (node.center && node.labels[0] === 'Person') {
                node.itemStyle = { color: 'red' }
                node.fixed=true
                const [x,y]=chart.value?.convertFromPixel({seriesIndex:0},[0,0])
                console.log(x,y)
                node.x=x
                node.y=y
            }
        })
        chart.value.setOption(option);
    }, 500)

})


</script>
<style lang="scss">
.container {
    min-width: 600px;
    min-height: 600px;
}
</style>