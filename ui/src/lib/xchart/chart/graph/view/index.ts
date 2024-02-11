import type { IView } from '../../view'
import type { Node, Edge, GraphChartContext } from '../Base'

import type { ChartContext, XChartContext } from '../../../Base'
import type { ITexture } from '@/lib/xchart/texture/basic'
import { CircleTexture } from '@/lib/xchart/texture'


import  { Container,Sprite,type ILineStyleOptions, Graphics } from 'pixi.js'


export type GraphViewProps = {
    nodeTexture?: ITexture<any>
    lineStyle?: ILineStyleOptions
}
export class GraphView<NodeType extends Node<any> = Node<any>> implements IView {
    ctx!: GraphChartContext<NodeType>//使用依赖注入
    nodes!:NodeType[]
    edges!:Edge<NodeType>[]
    viewContainer!: Container
    props!: GraphViewProps
    constructor(props?: GraphViewProps) {
        this.props=Object.assign({},{
            nodeTexture:new CircleTexture(),
            lineStyle:{ width: 2, color: 0x000000, alpha: 1 }
        },props)
    }
    init(ctx: GraphChartContext<NodeType>,props?: GraphViewProps,) {

        this.ctx = ctx
        if (!this.props!.nodeTexture!.ctx) this.props.nodeTexture!.init(ctx)

        this.props=Object.assign(this.props,props)
        this.viewContainer = new Container()
        this.ctx.chartContainer.addChild(this.viewContainer)
        return this
    }
    draw() {
        const nodes=this.ctx.nodes
        const edges=this.ctx.edges
        for(let i=0;i<nodes.length;i++){
            const node=nodes[i]
            let sprite = new Sprite(node.texture ? node.xTexture!.draw() : this.props.nodeTexture!.draw())
            nodes[i] = Object.assign(sprite, node)
            sprite.eventMode = 'static';//正常交互 dynamic表示还接受mock事件
            sprite.cursor = 'pointer'; // cursor change
            sprite.anchor.set(0.5, 0.5) // center the sprite's anchor point
            this.ctx.chartContainer.addChild(sprite)
        }
        for(let i=0;i<edges.length;i++){
            const edge=edges[i]
            let edgeGraphic = new Graphics()
            edges[i]=Object.assign(edgeGraphic,edge)
            edgeGraphic.lineStyle(this.props.lineStyle)
            console.log(edgeGraphic)
            edgeGraphic.moveTo(edge.sourceNode.x, edge.sourceNode.y)
            edgeGraphic.lineTo(edge.targetNode.x, edge.targetNode.y)
            this.ctx.chartContainer.addChild(edgeGraphic)
        }
        this.nodes=nodes
        this.edges=edges
        return this
    }
    redraw(){
        this.edges.forEach(edge=>{
            edge.clear()
            edge.lineStyle(this.props.lineStyle)
            edge.moveTo(edge.sourceNode.x, edge.sourceNode.y)
            edge.lineTo(edge.targetNode.x, edge.targetNode.y)
        })
        return this
    }
    clear(){
        this.ctx.chartContainer.removeChild(this.viewContainer)
        this.viewContainer=new Container()
    }
}