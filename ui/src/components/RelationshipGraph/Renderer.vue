<template>
  <div class="container" ref="container$"  @contextmenu.prevent>

  </div>
</template>
<script setup lang="ts">
import _json from "@/assets/json/neo4j.json"

import { type EChartsOption, init, type EChartsType } from 'echarts';
import { onMounted, watch } from 'vue';
import { ref } from 'vue';
import { useNeo4jData } from './DataFetch';
import type { Neo4jServerData } from './type';
import { shallowRef } from "vue";
import { useDragFixed, useRightClickMenu } from "@/hooks/RelationshipGraph";

const container$ = ref<HTMLElement>();
const sourceData = ref<Neo4jServerData>()
const graphData = useNeo4jData({
  sourceData
})

const chart = shallowRef<EChartsType>()
useDragFixed(graphData,chart)
useRightClickMenu(graphData,chart)
onMounted(async () => {
  let chartDom = container$.value;
  chart.value = init(chartDom!);
  chart.value.showLoading();
  sourceData.value = (await import('@/assets/json/neo4j.json')).default as any
  chart.value.hideLoading();
})
watch(() => graphData.value, () => {

  if (!graphData.value || !chart.value) return
  console.log(graphData?.value, 'graphData')

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
            name: category
          }
        }),

        symbolSize: 30,
        draggable: true,
        edgeSymbol: ['none', 'arrow'],
        nodes: graphData.value.nodes,
        edges: graphData.value.edges,
        force: {
          edgeLength: [100, 50],
          repulsion: 500,
          gravity: 0.2,
          initLayout:'circular',
          //layoutAnimation:false
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
          curveness:0.1
        },
        selectedMode:'multiple',
        select:{
          itemStyle:{
            shadowColor:"#fff",
            shadowBlur:10
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
})


</script>
<style lang="scss">
.container {
  min-width: 600px;
  min-height: 600px;
  //background-color: rgba($color: #000000, $alpha: .1);
}
</style>