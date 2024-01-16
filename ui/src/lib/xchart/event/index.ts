import type{ GraphEventModels } from "../chart/graph/event"
import PIXI from "pixi.js"
import type {DisplayObjectEvents} from 'pixi.js'


//TODO 约束type类型
export type XchartEventModels=GraphEventModels

export type EventType=XchartEventModels['type'] | keyof DisplayObjectEvents

export type EventMap={
    [key in XchartEventModels['type']]:Extract<XchartEventModels,{type:key}>

}&{
    [key in keyof DisplayObjectEvents]:PIXI.utils.EventEmitter.ArgumentMap<PIXI.DisplayObjectEvents>[Extract<key, keyof PIXI.DisplayObjectEvents>][0]
}
export type EventHandler< T extends EventType > = (e:EventMap[T])=>void


export class EventCenter{
    eventHandlers: Map<EventType, Map< EventHandler<EventType> ,EventHandler<EventType> >> = new Map()
    eventQueue: EventMap[keyof EventMap][] = []
    //NOTE 外部可以 emit mousedown事件吗 ， 方便mock交互
    //NOTE 调度串行设计，但是handler本身可以异步
    emit<T extends EventType>(eventType: T, e: EventMap[T]) {
        this.eventQueue.push(e)
    }
    on<T extends EventType>(eventType: T, eventHandler: EventHandler<T>) {
        const handlers = this.eventHandlers.get(eventType)
        if (!handlers) this.eventHandlers.set(eventType, new Map())
        handlers!.set(eventHandler as any,eventHandler as any)
    }
    once<T extends EventType>(eventType: T, eventHandler: EventHandler<T>) {
        const handlers = this.eventHandlers.get(eventType)
        const onceEventHandler = (e: EventMap[keyof EventMap]) => {
            eventHandler(e)
            this.off(eventType, onceEventHandler)
        }
        if (!handlers) this.eventHandlers.set(eventType, new Map())
        handlers!.set(eventHandler as any,eventHandler as any)
    }
    off(eventType: keyof EventMap, eventHandler: EventHandler<EventMap[keyof EventMap]>) {
        const handlers = this.eventHandlers.get(eventType)
        if (!handlers) return
        handlers.delete(eventHandler)
    }
    /**
     * 调度器调用的接口
     */
    process() {
        this.eventQueue.forEach(e => {
            const handlers = this.eventHandlers.get(e.type)
            if (!handlers) return
            handlers.forEach(handler => handler(e))
        })
    }
}