
import type { Application, Container, ApplicationOptions } from 'pixi.js'
import type { EventCenter } from './event'
import type { Viewport } from 'pixi-viewport'
export type XChartContext={
    pixiApp:Application
    eventCenter:EventCenter
    viewport:Viewport
}
export type ChartContext={
    chartContainer:Container
}&XChartContext
export type ViewContainer={
    viewContainer:Container
}&ChartContext
export type XchartConfig={
    dom:HTMLElement
    pixiOptions?:Partial<ApplicationOptions>
    viewport?:Viewport
}
export abstract class IModule{
    abstract init(ctx:any):void
}
export type ColorStringSymbol = `rgba(${number},${number},${number},${number})` | `rgb(${number},${number},${number})` | `#${number | string}${number | string}${number | string}${number | string}${number | string}${number | string}`
//TODO Other Color Model?
export type Color=ColorStringSymbol
