import { GraphView } from './view'
import type { Node, Edge, GraphChartContext } from './Base'
import type { ChartContext, XChartContext } from '../../Base'
import {  D3ForceLayout } from './layout'
import { Chart } from '../Base'
import type { ITexture } from '../../texture/basic'
import { Container, type DisplayObject } from 'pixi.js'

export type GraphProps<NodeType extends Node<any> = Node<any>> = {
    layout: D3ForceLayout<NodeType>
    view: GraphView<NodeType>
}
export class Graph<NodeType extends Node<any> = Node<any>, Layout extends D3ForceLayout<NodeType> = D3ForceLayout<NodeType>, View extends GraphView<NodeType> = GraphView<NodeType> > extends Chart<Layout, View>{
    layoutInstance: Layout
    viewInstance: View
    container: Container<DisplayObject>;
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
        if (!this.layoutInstance.ctx) this.layoutInstance.init(this.ctx)
        if (!this.viewInstance.ctx) this.viewInstance.init(this.ctx)
    }
    layout(args?: Parameters<Layout['layout']>[0]) {
        this.layoutInstance.layout(args)
        return this
    }
    draw(args?: any) {
        this.viewInstance.draw()
        return this
    }
    setData({
        nodes,
        edges
    }: {
        nodes: NodeType[],
        edges: Edge<NodeType>[]
    }) {
        this.ctx.nodes = nodes
        this.ctx.edges = edges
        return this
    }
}