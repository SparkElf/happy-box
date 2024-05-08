import type { IView } from '../../view'
import type { GraphNode, GraphEdge, GraphChartContext } from '../Base'

import type { ChartContext, XChartContext } from '../../../Base'
import type { ITexture } from '@/lib/xchart/texture/basic'
import { CircleTexture } from '@/lib/xchart/texture'


import  { Container,Sprite,type StrokeStyle, Graphics } from 'pixi.js'


export type GraphViewProps = {
    nodeTexture?: ITexture<any>
    lineStyle?: StrokeStyle
}
export class GraphView<NodeType extends GraphNode<any> = GraphNode<any>> implements IView {
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

        this.ctx.chartContainer.addChild(this.viewContainer = new Container({sortableChildren:true}))
        this.viewContainer.addChild(this.nodesContainer=new Container({zIndex: 10}))
        this.viewContainer.addChild(this.edgesContainer=new Container({zIndex: 9}))
        return this
    }
    draw() {

        const nodes=this.ctx.nodes
        const edges=this.ctx.edges
        for(let i=0;i<edges.length;i++){
            const edge=edges[i]

            edge.stroke(this.props.lineStyle)
            edge.moveTo(edge.sourceNode.x, edge.sourceNode.y)
            edge.lineTo(edge.targetNode.x, edge.targetNode.y)
            edge.zIndex = 9
            this.edgesContainer.addChild(edge)
        }
        for(let i=0;i<nodes.length;i++){
            const node=nodes[i]
            node.texture=node.xTexture?node.xTexture.draw():this.props.nodeTexture!.draw()
            node.eventMode = 'static';//正常交互 dynamic表示还接受mock事件
            node.cursor = 'pointer'; // cursor change
            node.anchor.set(0.5, 0.5) // center the sprite's anchor point
            node.zIndex = 10
            this.nodesContainer.addChild(node)
        }


        return this
    }
    redraw(){
        this.ctx.edges.forEach(edge=>{
            edge.clear()
            edge.stroke(this.props.lineStyle)
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