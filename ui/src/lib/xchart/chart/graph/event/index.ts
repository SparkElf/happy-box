import type { Simulation } from "../layout/D3Force/Simulation"

export type BeforeForceLayoutStepEventModel={
    type:'beforeForceLayoutStep'
}
export type AfterForceLayoutStepEventModel={
    type:'afterForceLayoutStep'
}


export type D3ForceSimulationTickEventModel={
    type:'d3ForceSimulationTick'
    simulation:Simulation<any>
}
export type D3ForceSimulationEndEventModel={
    type:'d3ForceSimulationEnd'
    simulation:Simulation<any>
}
export type D3ForceSimulationEventModel=D3ForceSimulationTickEventModel|D3ForceSimulationEndEventModel
export type GraphEventModels=BeforeForceLayoutStepEventModel|AfterForceLayoutStepEventModel|D3ForceSimulationEventModel