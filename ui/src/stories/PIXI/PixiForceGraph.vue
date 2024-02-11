<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { Viewport } from 'pixi-viewport'
import * as d3 from 'd3'
import { Sprite, Graphics, Application, SCALE_MODES } from 'pixi.js';
const pixiContainer$ = ref<HTMLDivElement | null>()
declare type Node = Sprite & {
    id?: string
    index?:number
    x: number
    y: number
    props: any
}
let nodes: Node[] = []
let edges: any[] = []
let edgeDrawer: Graphics
let viewport: Viewport
let app: Application<HTMLCanvasElement>
let simulation: d3.Simulation<Node, undefined>
function generateNodes(nodesNum = 50) {
    const nodes: Node[] = []
    const box = pixiContainer$.value!.getBoundingClientRect()
    for (let i = 0; i < nodesNum; i++) {
        const node = {props:{}} as any
        node.x = Math.random() * box.width;
        node.y = Math.random() * box.height;
        node.props.radius = 10;
        node.index = i;
        nodes.push(node);
    }
    return nodes
}
function generateEdges(nodes: Node[]) {
    const edges = d3.range(nodes.length - 1).map(i => ({
        source: Math.floor(Math.sqrt(i)),
        target: i + 1,
        value: Math.random() + 0.5
    }));
    return edges;
}

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
    nodes=nodes.map((node) => {
        const circle = new Graphics()
        circle.beginFill(0x000000)
        circle.lineStyle({color:'red',width:10})
        circle.drawCircle(0, 0, node.props.radius)

        circle.endFill()
        const texture=app.renderer.generateTexture(circle,{scaleMode: SCALE_MODES.LINEAR,resolution:2})
        let sprite = new Sprite(texture) as Node
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
    edges.forEach(link => {
        let { source, target } = link;
        edgeDrawer.lineStyle(link.value, 0x000000);
        edgeDrawer.moveTo(source.x, source.y);
        edgeDrawer.lineTo(target.x, target.y);
    });
    edgeDrawer.endFill();
}

function render() {

    const box = pixiContainer$.value!.getBoundingClientRect()
    renderNodes()
    renderEdges()
    const simulation = d3
    .forceSimulation(nodes)
    .velocityDecay(0.8)
    .force(
      "charge",
      d3
        .forceManyBody()
        .strength(-100)
        .distanceMax(250)
        .distanceMin(80)
    )
    .force(
      "center",
      d3
        .forceCenter()
        .x(box.width * 0.5)
        .y(box.height * 0.5)
    )
    .force(
      "link",
      d3
        .forceLink(edges)
        .id(d => d.index!)
        .distance(80)
        .strength(d => d.value)
    )

    .on("tick", ()=>{
        updateEdges()
    });

}
onMounted(() => {
    if (!pixiContainer$.value) return
    nodes = generateNodes()
    edges = generateEdges(nodes)
    console.log(edges)
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