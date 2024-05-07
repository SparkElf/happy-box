
import { EventCenter } from './event'
import type { XChartContext, XchartConfig } from './Base'
import type { Chart } from './chart/Base'
import { Viewport } from 'pixi-viewport'
import { Application, type ApplicationOptions } from 'pixi.js'
export class XChart{
    ctx!:XChartContext
    eventCenter=new EventCenter()
    charts:any={}
    viewport!: Viewport
    constructor(config:XchartConfig){
        this.init(config)
    }
    on=this.eventCenter.on
    off=this.eventCenter.off
    once=this.eventCenter.once
    async init(config:XchartConfig){
        if(!config.pixiOptions){

            config.pixiOptions=Object.assign({
                antialias:true,
                resolution:window.devicePixelRatio || 1,
                autoDensity:true,
                backgroundColor:0xffffff

            }as ApplicationOptions,config.pixiOptions||{})
        }
        const app=new Application()
        await app.init(config.pixiOptions)
        this.viewport = config.viewport ? config.viewport : new Viewport({
            screenHeight: app.canvas.height,
            screenWidth: app.canvas.width,
            events:app.renderer.events
        }).drag().pinch().wheel().decelerate()

        this.ctx={
            pixiApp:app,
            eventCenter:this.eventCenter,
            viewport:this.viewport
        }
        app.stage.addChild(this.viewport)

        config.dom.appendChild(app.canvas as any)
        //
        window.__PIXI_APP__ = app
    }
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