
import { EventCenter } from './event'
import type { XChartContext, XchartConfig } from './Base'
import type { Chart } from './chart/Base'
import { Viewport } from 'pixi-viewport'
import { Application } from 'pixi.js'
export class XChart{
    ctx:XChartContext
    eventCenter=new EventCenter()
    charts:any={}
    viewport: Viewport
    constructor(config:XchartConfig){
        const app=new Application(config.pixiOptions)
        this.viewport = config.viewport ? config.viewport : new Viewport({
            screenHeight: app.view.height,
            screenWidth: app.view.width,
            events:app.renderer.events
        }).drag().pinch().wheel().decelerate()

        this.ctx={
            pixiApp:app,
            eventCenter:this.eventCenter,
            viewport:this.viewport
        }
        app.stage.addChild(this.viewport)

        config.dom.appendChild(app.view as any)
        //
        window.__PIXI_APP__ = app
    }
    on=this.eventCenter.on
    off=this.eventCenter.off
    once=this.eventCenter.once
    setChart(id:string,chart:Chart){
        if(!chart.ctx)chart.init(this.ctx)  //依赖注入
        this.charts[id]=chart
    }
    getChart(id:string){
        return this.charts[id]
    }
    removeChart(id:string){
        this.charts[id]=null
    }
}
export * from './chart'