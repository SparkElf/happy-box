<script setup lang="ts">
import { XChart, Graph } from "@/lib/xchart";
import { D3ForceLayout } from "@/lib/xchart/chart/graph/layout";
import { GraphView } from "@/lib/xchart/chart/graph/view";
import { onMounted, ref, shallowRef } from "vue";
import type { Node, Edge } from "@/lib/xchart/chart/graph/Base";

import {nodes,edges} from './share'
import { CircleTexture } from "@/lib/xchart/texture";
const pixiContainer$ = ref<HTMLDivElement>()
const app = shallowRef<XChart>()
const graphChart = shallowRef(new Graph({
    layout: new D3ForceLayout({}),
    view: new GraphView({
        nodeTexture:new CircleTexture()
    })
}))

onMounted(async () => {
    app.value = new XChart()
    await app.value.init({
        dom: pixiContainer$.value!,
        pixiOptions: {
            backgroundColor: 0xFFFFFF,
            antialias:true,
            resolution:window.devicePixelRatio||4,
            autoDensity:true,
        }
    })
    app.value.setChart('force-graph', graphChart.value)

    graphChart.value.setData({ nodes, edges }).layout().draw()
})
</script>
<template>
    <div ref="pixiContainer$" class="pixiContainer">

    </div>
</template>
<style lang="scss" scoped>
.pixiContainer {
    width: 600px;
    height: 600px;
}
</style>