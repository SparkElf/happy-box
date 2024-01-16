import * as PIXI from 'pixi.js'
import type { EventCenter } from '../event'
export type XChartContext={
    pixiApplication:PIXI.Application
    eventCenter:EventCenter
}