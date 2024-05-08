import type { GraphNode } from '@/lib/xchart/chart/graph/Base';
import * as d3 from 'd3'
const width=600
const height=600
function generateNodes(nodesNum = 50) {
    const nodes: GraphNode[] = []
    for (let i = 0; i < nodesNum; i++) {
        const node = {} as any
        node.x = Math.random() * width;
        node.y = Math.random() * height;
        node.index = i;
        node.id = i.toString();
        node.xTexture={props:{radius:10}}
        nodes.push(node);
    }
    return nodes
}
function generateEdges(nodes: GraphNode[]) {
    const edges = d3.range(nodes.length - 1).map(i => ({
        source: Math.floor(Math.sqrt(i)).toString(),
        target: (i + 1).toString(),
        value: Math.random() + 0.5
    }));
    return edges;
}
const nodes = generateNodes(50)
const edges=generateEdges(nodes) as any[]
export {nodes,edges}