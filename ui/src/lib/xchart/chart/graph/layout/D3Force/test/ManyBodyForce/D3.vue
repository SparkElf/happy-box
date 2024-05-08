<script setup lang="ts">
import { onMounted, ref, shallowRef } from 'vue';

import { Viewport } from 'pixi-viewport'
import {forceCenter, forceLink, forceSimulation} from '../d3-force/src'
import type { GraphEdge, GraphNode } from '@/lib/xchart/chart/graph/Base';
import { SCALE_MODES, Sprite,  Application,  Graphics } from 'pixi.js';
const pixiContainer$ = ref<HTMLDivElement | null>()
const props=defineProps<{
    nodes:GraphNode[]
    edges:GraphEdge<GraphNode>[]
}>()
const nodes=shallowRef(structuredClone(props.nodes))
const edges=shallowRef(structuredClone(props.edges))

let edgeDrawer: Graphics
let viewport: Viewport
let app: Application<HTMLCanvasElement>
let simulation: d3.Simulation<GraphNode, undefined>

function initPixi() {
    app = new Application<HTMLCanvasElement>({ backgroundColor: 0xFFFFFF, resizeTo: pixiContainer$.value!,antialias: true  });
    pixiContainer$.value!.appendChild(app.view as any)
    const viewport = new Viewport({
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight,
        events: app.renderer.events // the interaction module is important for wheel to work properly when renderer.view is placed or scaled
    })
    app.stage.addChild(viewport)
    viewport
        .drag()
        .pinch()
        .wheel()
        .decelerate()
    return viewport
}
function renderNodes() {
    nodes.value=nodes.value.map((node) => {
        const circle = new Graphics()
        circle.beginFill(0x000000)
        circle.lineStyle({color:'red',width:10})
        circle.drawCircle(0, 0, node.xTexture!.props.radius)
        circle.endFill()
        const texture=app.renderer.generateTexture(circle,{scaleMode: SCALE_MODES.LINEAR,resolution:2})
        let sprite = new Sprite(texture) as GraphNode
        sprite = Object.assign(sprite, node)
        sprite.eventMode = 'static';//正常交互 dynamic表示还接受mock事件
        sprite.cursor = 'pointer'; // cursor change
        sprite.anchor.set(0.5, 0.5) // center the sprite's anchor point
        viewport.addChild(sprite)
        return sprite
    })
}
function renderEdges(){
    edgeDrawer = new Graphics();
    viewport.addChild(edgeDrawer)
}
function updateEdges() {
    edgeDrawer.clear();
    edgeDrawer.alpha = 0.07;
    edges.value.forEach(link => {
        let { source, target } = link;
        edgeDrawer.lineStyle((link as any).value, 0x000000);
        edgeDrawer.moveTo((source as any).x, (source as any).y);
        edgeDrawer.lineTo((target as any).x, (target as any).y);
    });
    edgeDrawer.endFill();
}

function render() {

    const box = pixiContainer$.value!.getBoundingClientRect()
    renderNodes()
    renderEdges()
    const simulation =
    forceSimulation(nodes.value)
    .force(
      "center",
      forceCenter(box.width * 0.5,box.height * 0.5)
    )
    .force(
      "link",

        forceLink(edges.value)
        .id((d:any) => (d as any).id!)
    )
    .on("tick", ()=>{
        updateEdges()
    });

}
onMounted(() => {

    if (!pixiContainer$.value) return
    viewport = initPixi()
    render()
})
</script>
<template>
    <div ref="pixiContainer$" class="PixiContainer">
    </div>
</template>
<style lang="scss">
.PixiContainer {
    width: 600px;
    height: 600px;
    overflow: hidden;
}
</style>