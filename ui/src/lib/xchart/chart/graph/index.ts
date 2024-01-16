import {GraphView} from './view'
import type { Node, Edge } from './Base'
import type { XChartContext } from '../../types'
export type GraphOption = {
    layout:'force'|'base'
}
export class Graph{
    layout:'force'|'base'='force'
    nodes:Node[]=[]
    edges:Edge[]=[]
    symbol:'circle'|'rect'='circle'
    views:{
        'force':GraphView
    }
    constructor(option:GraphOption,ctx:XChartContext){
        this.layout=option.layout
        this.views={
            'force':new GraphView({
                symbol:this.symbol
            },ctx)
        }
    }
    draw(){
        if(this.layout==='force')this.views['force'].draw(this.nodes,this.edges)
    }
    setData({
        nodes,
        edges
    }:{
        nodes:Node[],
        edges:Edge[]
    }){
        this.nodes=nodes
        this.edges=edges
    }
}