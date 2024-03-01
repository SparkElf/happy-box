import { Force, jiggle, type ForceContext } from "./Force";
import type { Node, Edge } from '@/lib/xchart/chart/graph/Base'

export class LinkForce<NodeType extends Node<any> = Node<any>> extends Force<NodeType> {
    ctx!: ForceContext<NodeType>;

    private strengths!: number[]
    private distances!: number[]
    private bias!: number[]
    private strength!: (edge: Edge<NodeType>) => number
    private isDefaultStrength=true
    private distance!: (edge: Edge<NodeType>) => number
    private iteration!: (edges: Edge<NodeType>[]) => number
    constructor() {
        super()
    }
    init(ctx: ForceContext<NodeType>) {
        this.ctx = ctx
        const { nodes, edges } = this.ctx
        const n = nodes.length, m = edges.length
        const count = new Array(n).fill(0)
        //其中 count(node) 是一个函数，返回以给定节点作为源或目标的链接数。选择此默认值是因为它会自动降低连接到密集连接节点的链路强度，从而提高稳定性。
        if(this.isDefaultStrength)this.strength = (edge) => (1 / Math.min(count[edge.sourceNode.index], count[edge.targetNode.index]))
        this.iteration ??= () => 1
        this.distance ??= () => 30

        for (let i = 0; i < m; i++) {
            const edge = edges[i]
            count[edge.sourceNode.index]++;
            count[edge.targetNode.index]++;
        }
        this.bias = new Array(m)
        for (let i = 0; i < m; i++) {
            const edge = edges[i]
            this.bias[i] = count[edge.sourceNode.index] / (count[edge.sourceNode.index] + count[edge.targetNode.index])
        }

        this.strengths = new Array(m)
        this.distances = new Array(m)

        for (let i = 0; i < this.ctx.edges.length; ++i) {
            this.strengths[i] = this.strength(this.ctx.edges[i]);
        }
        for (let i = 0; i < this.ctx.edges.length; ++i) {
            this.distances[i] = this.distance(this.ctx.edges[i]);
        }

    }
    force(alpha: number) {
        //console.log(this.distances,this.strengths,'distances and strength')
        const edges = this.ctx.edges
        const iteration = this.iteration(edges)
        for (let k = 0; k < iteration; ++k) {
            for (let i = 0; i < edges.length; ++i) {
                const edge = edges[i], sourceNode = edge.sourceNode, targetNode = edge.targetNode;
                let x = targetNode.x  - sourceNode.x  || jiggle();
                let y = targetNode.y  - sourceNode.y  || jiggle();
                let l = Math.sqrt(x * x + y * y), b;
                l = (l - this.distances[i]) / l * alpha * this.strengths[i];
                x *= l, y *= l;
                //console.log(l,x,y)
                targetNode.vx -= x * (b = this.bias[i]);
                targetNode.vy -= y * b;
                sourceNode.vx += x * (b = 1 - b);
                sourceNode.vy += y * b;
            }
        }
    }
    //如果增加连接的刚性，就意味着增加每个弹簧的紧密程度，使得整个网格更难变形或扭曲，更不受其他力的影响
    setIteration(v: number | ((edges: Edge<any>[]) => number)) {
        if (typeof v === 'function') this.iteration = v
        else if (typeof v === 'number') this.iteration = (edges: Edge<any>[]) => v
        else throw new Error("iteration must be a number or a function")
        return this
    }
    setStrength(v?: number | ((edge: Edge<any>) => number)) {
        if(v==null)this.isDefaultStrength=true
        else this.isDefaultStrength=false
        if (typeof v === 'function') this.strength = v
        else if (typeof v === 'number') this.strength = (edge: Edge<any>) => v
        else throw new Error("strength must be a number or a function")
        return this
    }
    setDistance(v: number | ((edge: Edge<any>) => number)) {
        if (typeof v === 'function') this.distance = v
        else if (typeof v === 'number') this.distance = (edge: Edge<any>) => v
        else throw new Error("distance must be a number or a function")
        return this
    }
}
