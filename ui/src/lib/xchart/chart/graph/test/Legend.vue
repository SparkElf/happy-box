<script setup lang="ts">
import { XChart, Graph } from "@/lib/xchart";
import { D3ForceLayout } from "@/lib/xchart/chart/graph/layout";
import { GraphView } from "@/lib/xchart/chart/graph/view";
import { onMounted, ref, shallowRef, watch } from "vue";
import type { GraphNode, GraphEdge } from "@/lib/xchart/chart/graph/Base";

import {nodes as generatedNodes,edges as generatedEdges} from './share'
import { CircleTexture } from "@/lib/xchart/texture";
import { Assets, Texture } from "pixi.js";
import carImg from '@/assets/icon/car.png'
import Legend from "@/lib/xchart/legend/Legend.vue";
import { useLegendGraph } from "../hooks";

const originNodes=shallowRef(generatedNodes)
const originEdges = shallowRef(generatedEdges)

const pixiContainer$ = ref<HTMLDivElement>()
const app = shallowRef<XChart>()
const graphChart = shallowRef(new Graph({
    layout: new D3ForceLayout({}),
    view: new GraphView({
        nodeTexture:new CircleTexture({img:await Assets.load(carImg),border:{width:20,color:0x000000}})
    })
}))
const {nodes,edges,selectedLegends}=useLegendGraph(originNodes,originEdges)
watch(selectedLegends,(val)=>{
    console.log(nodes,edges)
    graphChart.value.setData({ nodes:nodes.value, edges : edges.value }).layout().draw()
})
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

    graphChart.value.setData({ nodes:nodes.value, edges : edges.value }).layout().draw()
})
</script>
<template>
    <div ref="pixiContainer$" class="pixiContainer">
        <Legend :selecteds="selectedLegends" @update:selected="val=>selectedLegends=val" :legends="[{name:'a'},{name:'b'},{name:'c'},{name:'d'}]">
        </Legend>
    </div>
</template>
<style lang="scss" scoped>
.pixiContainer {
    width: 600px;
    height: 600px;
}
</style>