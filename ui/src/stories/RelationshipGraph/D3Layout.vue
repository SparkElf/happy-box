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
import G6 from '@antv/g6'
import {TreeGraph} from '@antv/g6'
const container$ = ref<HTMLElement>();
const sourceData = shallowRef<Neo4jServerData>()

const chart = shallowRef<TreeGraph>()
onMounted(async () => {
    let chartDom = container$.value;
    const width = 800
    const height = 600
    chart.value = new G6.TreeGraph({
      container:  container$.value!,

      linkCenter: true,
      modes: {
        default: [
          {
            type: 'collapse-expand',
            onChange: function onChange(item, collapsed) {
              const data = item!.get('model');
              data.collapsed = collapsed;
              return true;
            },
          },
          'drag-canvas',
          'zoom-canvas',
        ],
      },
      defaultNode: {
        size: 26,
      },
      layout: {
        type: 'dendrogram',
        direction: 'H',
        nodeSep: 20,
        rankSep: 100,
        radial: true,
      },
    });

    sourceData.value = (await import('@/assets/json/RelationshipGraph/g6tree.json')).default as any
})
watch(sourceData, () => {

    if (!sourceData.value || !chart.value||!container$.value) return

    chart.value.node(function (node) {
      return {
        label: node.id,
      };
    });

    chart.value.data(sourceData.value);
    chart.value.render();
    chart.value.fitView();

})

</script>
<style lang="scss">
.container {
    min-width: 800px;
    min-height: 600px;
}
</style>