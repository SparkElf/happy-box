
import { IModule, type XChartContext } from "../Base";
import { Container } from "pixi.js";
export abstract class Chart<Layout=any,View=any, Context=XChartContext> extends IModule{
    abstract ctx:Context
    abstract layoutInstance:Layout
    abstract viewInstance:View
    abstract container:Container
    abstract layout(args:any):void
    abstract draw(args:any):void
    abstract setData(data:any):void
}