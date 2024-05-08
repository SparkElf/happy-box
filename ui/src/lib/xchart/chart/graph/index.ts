import { GraphView } from './view'
import type { GraphNode, GraphEdge, GraphChartContext } from './Base'
import type { ChartContext, XChartContext } from '../../Base'
import {  D3ForceLayout } from './layout'
import { Chart } from '../Base'
import type { ITexture } from '../../texture/basic'
import { Container, Sprite,  Graphics } from 'pixi.js'

export type GraphProps<NodeType extends GraphNode<any> = GraphNode<any>> = {
    layout: D3ForceLayout<NodeType>
    view: GraphView<NodeType>
}
export class Graph<NodeType extends GraphNode<any> = GraphNode<any>, Layout extends D3ForceLayout<NodeType> = D3ForceLayout<NodeType>, View extends GraphView<NodeType> = GraphView<NodeType> > extends Chart<Layout, View>{
    layoutInstance: Layout
    viewInstance: View
    container: Container;
    textrue!: ITexture<NodeType>
    ctx!: GraphChartContext<NodeType>
    constructor(props: GraphProps<NodeType>, ctx?: XChartContext) {
        super()
        this.layoutInstance = props.layout as any
        this.viewInstance = props.view as any
        this.container = new Container()
        //依赖注入
        if (ctx) this.init(ctx)
    }

    init(ctx: XChartContext): void {
        if (!this.ctx) this.ctx = Object.assign({}, ctx, { chartContainer: this.container,nodes:[],edges:[] })
        this.ctx.viewport.addChild(this.container)
        if (!this.layoutInstance.ctx) this.layoutInstance.init(this.ctx)
        if (!this.viewInstance.ctx) this.viewInstance.init(this.ctx)
    }
    layout(args?: Parameters<Layout['layout']>[0]) {
        this.layoutInstance.layout()
        return this
    }
    draw(args?: any) {
        this.viewInstance.draw()
        this.layoutInstance.props.simulation.on('d3ForceSimulationTick',()=>{
            //console.log('tick')
            //console.log(this.ctx.nodes[0].x,'node')
            this.viewInstance.redraw()
        })
        return this
    }
    setData(data: {
        nodes?: NodeType[],
        edges?: GraphEdge<NodeType>[]
    }) {
        const {nodes,edges}=data
        if(nodes)
            this.ctx.nodes = nodes.map(node=>Object.assign(new Sprite(),node))
        if(edges)
            this.ctx.edges = edges.map(edge=>Object.assign(new Graphics(),edge))
        console.log(this.ctx.nodes[0].x,'2')
        this.ctx.eventCenter.emit('updateGraphDataEvent',{type:'updateGraphDataEvent',data:{
            nodes:nodes?this.ctx.nodes:undefined,
            edges:edges?this.ctx.edges:undefined
        } })

        return this
    }
}