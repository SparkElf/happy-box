<script setup lang="ts">
import { XChart, Graph } from "@/lib/xchart";
import { D3ForceLayout } from "@/lib/xchart/chart/graph/layout";
import { GraphView } from "@/lib/xchart/chart/graph/view";
import { onMounted, ref, shallowRef } from "vue";
import type { Node, Edge } from "@/lib/xchart/chart/graph/Base";
import * as d3 from "d3";
const pixiContainer$ = ref<HTMLDivElement>()
const app = shallowRef<XChart>()
const graphChart = shallowRef(new Graph({
    layout: new D3ForceLayout({}),
    view: new GraphView()
}))
function generateNodes(nodesNum = 50) {
    const nodes: Node[] = []
    const box = pixiContainer$.value!.getBoundingClientRect()
    for (let i = 0; i < nodesNum; i++) {
        const node = { props: {} } as any
        node.x = Math.random() * box.width;
        node.y = Math.random() * box.height;
        node.props.radius = 10;
        node.id = i.toString();
        nodes.push(node);
    }
    return nodes
}
function generateEdges(nodes: Node[]) {
    const edges = d3.range(nodes.length - 1).map(i => ({
        source: { id: Math.floor(Math.sqrt(i)).toString() },
        target: { id: (i + 1).toString() },
        value: Math.random() + 0.5
    }));
    return edges as any as Edge[];
}
let nodes: Node[]
let edges: Edge[]
onMounted(() => {

    app.value = new XChart({
        dom: pixiContainer$.value!,
        pixiOptions: {
            backgroundColor: 0xFFFFFF
        }
    })
    app.value.setChart('force-graph', graphChart.value)
    nodes = generateNodes()
    edges = generateEdges(nodes)
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