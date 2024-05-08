
import { Layout } from "../../../layout";

import { type GraphNode, type GraphEdge, type GraphChartContext } from '../../Base'
import { CenterForce } from "./CenterForce";
import { CollideForce } from "./CollideForce";
import { LinkForce } from "./LinkForce";
import { ManyBodyForce } from "./ManyBodyForce";
import { Simulation } from "./Simulation";

export type D3ForceLayoutProps<NodeType extends GraphNode = GraphNode> = {
    simulation?: Simulation<NodeType>
}
export class D3ForceLayout<NodeType extends GraphNode = GraphNode> extends Layout<D3ForceLayoutProps<NodeType>>{
    ctx!: GraphChartContext<NodeType>
    props!: Required<D3ForceLayoutProps<NodeType>>
    constructor(props: D3ForceLayoutProps<NodeType>) {
        super()
        this.props = Object.assign({}, props) as any
    }
    init(ctx: GraphChartContext<NodeType>) {
        this.ctx = ctx
        if (!this.props.simulation) {
            const dom = this.ctx.pixiApp.view
            this.props.simulation =   new Simulation<NodeType>()
            .setAlphaDecay(0.005)
            .setForce('center', new CenterForce().setX(dom.width/2).setY(dom.height/2))
            .setForce('link', new LinkForce().setDistance(100))
            .setForce('gravity', new ManyBodyForce().setStrength(-50))
            .setForce('collide',new CollideForce().setRadius(30))
            .init(this.ctx)
        }
        this.ctx.eventCenter.on('updateGraphDataEvent',(e)=>{
            if(e.data.nodes)this.props.simulation.initNodes()
            if(e.data.edges)this.props.simulation.initEdges()
            this.props.simulation.initForces()

        })
        return this
    }
    setProps(props:  D3ForceLayoutProps<NodeType>){
        this.props=Object.assign(this.props,props)
        this.init(this.ctx)
        return this
    }
    layout(): void {
        const simulation=this.props.simulation
        console.log(simulation.alpha,'simulation.alpha')
        if(simulation.alpha===1)
            this.props.simulation.start()
        else
            this.props.simulation.restart()
    }
}