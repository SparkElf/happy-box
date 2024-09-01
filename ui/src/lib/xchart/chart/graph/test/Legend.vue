<script setup lang="ts">
import { XChart, Graph } from "@/lib/xchart";
import { D3ForceLayout } from "@/lib/xchart/chart/graph/layout";
import { GraphView } from "@/lib/xchart/chart/graph/view";
import { onMounted, ref, shallowRef, watch } from "vue";
import type { GraphNode, GraphEdge } from "@/lib/xchart/chart/graph/Base";

import {nodes as generatedNodes,edges as generatedEdges} from './share'
import { CircleTexture } from "@/lib/xchart/texture";
import { Assets, Texture } from "pixi.js";

import Legend from "@/lib/xchart/legend/Legend.vue";
import { useLegendGraph } from "../hooks";
import { getLevelGraphByIdcardApi } from "@/api/xchart/graph";
import carImg from '@/assets/icon/car.png'
import personImg from '@/assets/icon/person.png'
import hotelImg from '@/assets/icon/hotel.png'
import shopImg from '@/assets/icon/shop.png'
import { createIntSequence } from "@/utils/mock";
const originNodes=shallowRef(generatedNodes)
const originEdges = shallowRef(generatedEdges)

const pixiContainer$ = ref<HTMLDivElement>()
const app = shallowRef<XChart>()
const graphChart = shallowRef(new Graph({
    layout: new D3ForceLayout({}),
    view: new GraphView({
        nodeTexture:new CircleTexture({img:await Assets.load(carImg)}),
        lineStyle:{
            width:1,
            color:'rgba(0, 103, 255, 0.5)'
        }
    })
}))
const legends=[{name:'车辆',img:carImg},{name:'人员',img:personImg},{name:'酒店',img:hotelImg},{name:'商店',img:shopImg}]
const {nodes,edges,selectedLegends}=useLegendGraph(originNodes,originEdges,createIntSequence(0,legends.length-1))

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
        <Legend :selecteds="selectedLegends" @update:selected="val=>selectedLegends=val" :legends="legends">
        </Legend>
    </div>
</template>
<style lang="scss" scoped>
.pixiContainer {
    width: 600px;
    height: 600px;
}
</style>