import { Layout } from "../../../layout";
import * as d3 from "d3";
import { type Node, type Edge, type GraphChartContext } from '../../Base'

export type D3ForceLayoutProps<NodeType extends Node<any> = Node<any>> = {
    simulation?: d3.Simulation<NodeType, Edge<NodeType>>
}
export class D3ForceLayout<NodeType extends Node<any> = Node<any>> extends Layout<D3ForceLayoutProps<NodeType>>{
    ctx!: GraphChartContext<NodeType>
    props!: Required<D3ForceLayoutProps<NodeType>>
    constructor(props: D3ForceLayoutProps<NodeType>) {
        super()
        this.props = Object.assign({}, props) as any
    }
    init(ctx: GraphChartContext<NodeType>): void {
        this.ctx = ctx
    }
    layout(props?:  D3ForceLayoutProps<NodeType> ): void {
        let nodes: NodeType[]=this.ctx.nodes, edges: Edge<NodeType>[]=this.ctx.edges
        this.props=Object.assign(this.props,props)

        if (!this.props.simulation) {
            const dom = this.ctx.pixiApp.view
            this.props.simulation = d3.forceSimulation(nodes)
                .force("link", d3.forceLink<NodeType, Edge<NodeType>>(edges).id((node,i) => {
                    // console.log(node,typeof node.id,node.id)
                    return node.id
                }))
                .force("charge", d3.forceManyBody())
                .force("center", d3.forceCenter(dom.width / 2, dom.height / 2));
        } else {
            this.props.simulation.nodes(nodes).force("link", d3.forceLink<NodeType, Edge<NodeType>>(edges).id(d => d.id)).alpha(1).restart()
        }
    }
}