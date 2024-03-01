import type { IView } from '../../view'
import type { Node, Edge, GraphChartContext } from '../Base'

import type { ChartContext, XChartContext } from '../../../Base'
import type { ITexture } from '@/lib/xchart/texture/basic'
import { CircleTexture } from '@/lib/xchart/texture'


import  { Container,Sprite,type ILineStyleOptions, Graphics, SCALE_MODES } from 'pixi.js'


export type GraphViewProps = {
    nodeTexture?: ITexture<any>
    lineStyle?: ILineStyleOptions
}
export class GraphView<NodeType extends Node<any> = Node<any>> implements IView {
    ctx!: GraphChartContext<NodeType>//使用依赖注入

    viewContainer!: Container
    nodesContainer!:Container
    edgesContainer!:Container
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

        this.ctx.chartContainer.addChild(this.viewContainer = new Container())
        this.viewContainer.addChild(this.nodesContainer=new Container())
        this.viewContainer.addChild(this.edgesContainer=new Container())
        return this
    }
    draw() {

        const nodes=this.ctx.nodes
        const edges=this.ctx.edges
        for(let i=0;i<nodes.length;i++){
            const node=nodes[i]
            node.texture=node.xTexture?node.xTexture.draw():this.props.nodeTexture!.draw()
            node.eventMode = 'static';//正常交互 dynamic表示还接受mock事件
            node.cursor = 'pointer'; // cursor change
            node.anchor.set(0.5, 0.5) // center the sprite's anchor point
            this.nodesContainer.addChild(node)
        }
        for(let i=0;i<edges.length;i++){
            const edge=edges[i]
            
            edge.lineStyle(this.props.lineStyle)
            edge.moveTo(edge.sourceNode.x, edge.sourceNode.y)
            edge.lineTo(edge.targetNode.x, edge.targetNode.y)
            this.edgesContainer.addChild(edge)
        }

        return this
    }
    redraw(){
        this.ctx.edges.forEach(edge=>{
            edge.clear()
            edge.lineStyle(this.props.lineStyle)
            edge.moveTo(edge.sourceNode.x, edge.sourceNode.y)
            edge.lineTo(edge.targetNode.x, edge.targetNode.y)
            edge.endFill();
        })
        return this
    }
    clear(){
        this.ctx.chartContainer.removeChild(this.viewContainer)
        this.viewContainer=new Container()
    }
}