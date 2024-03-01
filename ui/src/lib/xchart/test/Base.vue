<script setup lang="ts">
import { XChart, Graph } from "@/lib/xchart";
import { D3ForceLayout } from "@/lib/xchart/chart/graph/layout";
import { GraphView } from "@/lib/xchart/chart/graph/view";
import { onMounted, ref, shallowRef } from "vue";
import type { Node, Edge } from "@/lib/xchart/chart/graph/Base";

import { nodes, edges } from './share'
import { CircleTexture } from "@/lib/xchart/texture";
import { Application, Container, Graphics, SCALE_MODES, Sprite } from "pixi.js";
import { Viewport } from "pixi-viewport";
const pixiContainer$ = ref<HTMLDivElement>()


onMounted(() => {

    const app = new Application({  backgroundColor:0xffffff, width: pixiContainer$.value?.getBoundingClientRect().width, height: pixiContainer$.value?.getBoundingClientRect().height })
    
    let viewport = new Viewport({
        screenHeight: app.view.height,
        screenWidth: app.view.width,
        events: app.renderer.events
    }).drag().pinch().wheel().decelerate()
    app.stage.addChild(viewport)
    const circle = new Graphics()
    circle.beginFill(0x000000)
    circle.drawCircle(0,0, 10)
    circle.endFill()
    let sprite = new Sprite(app.renderer.generateTexture(circle, { scaleMode: SCALE_MODES.LINEAR, resolution: 2 }))
    sprite.x=300
    sprite.y=300
    //viewport.addChild(sprite)
    const chartContainer=new Container()
    const viewContainer=new Container()
    chartContainer.addChild(viewContainer)
    viewContainer.addChild(sprite)
    viewport.addChild(chartContainer)
    pixiContainer$.value?.appendChild(app.view as any)
    window.__PIXI_APP__ = app
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