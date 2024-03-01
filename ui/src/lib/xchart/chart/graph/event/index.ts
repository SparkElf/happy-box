import type {Node, Edge } from "../Base"
import type { Simulation } from "../layout/D3Force/Simulation"

export type D3ForceSimulationTickEventModel={
    type:'d3ForceSimulationTick'
    simulation:Simulation<any>
}
export type D3ForceSimulationEndEventModel={
    type:'d3ForceSimulationEnd'
    simulation:Simulation<any>
}
export type D3ForceSimulationEventModel=D3ForceSimulationTickEventModel|D3ForceSimulationEndEventModel
export type UpdateGraphDataEventModel={
    type:'updateGraphDataEvent'
    data:{
        nodes?:Node[]
        edges?:Edge[]
    }
}
export type GraphEventModels=D3ForceSimulationEventModel|UpdateGraphDataEventModel