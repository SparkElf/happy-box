import type {View} from'./Base'
import type {Node,Edge} from'../Base'
import type { XChart } from '../../../'
import type { XChartContext } from '../../../types'
export class GraphView implements View{
    //使用依赖注入
    ctx:XChartContext
    constructor(options:{
        // symbol:
    },ctx:XChartContext){
        this.ctx=ctx
    }
    draw(nodes:Node[],edges:Edge[]): void {
        const pixi=this.ctx.pixiApplication

    }
}