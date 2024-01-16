import * as PIXI from 'pixi.js'
import { EventCenter } from './event'
import type { XChartContext } from './types'
export class XChart{
    ctx:XChartContext
    eventCenter=new EventCenter()
    constructor(config:any){
        this.ctx={
            pixiApplication:new PIXI.Application(config.pixiOptions),
            eventCenter:this.eventCenter
        }
        config.dom.appendChild(this.ctx.pixiApplication.view)
    }
    on=this.eventCenter.on
    off=this.eventCenter.off
    once=this.eventCenter.once
}