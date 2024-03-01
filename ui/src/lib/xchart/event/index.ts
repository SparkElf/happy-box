import type { utils, DisplayObjectEvents } from "pixi.js"
import type { GraphEventModels } from "../chart/graph/event"


//TODO 约束type类型
export type XchartEventModels = GraphEventModels
export type XchartEventMap<EventModel extends { type: string } = XchartEventModels> = {
    [key in EventModel['type']]: Extract<EventModel, { type: key }>
}
export type PixiEventMap = {
    [key in keyof DisplayObjectEvents]: utils.EventEmitter.ArgumentMap<DisplayObjectEvents>[Extract<key, keyof DisplayObjectEvents>][0]
}
export type EventType = XchartEventModels['type'] | keyof DisplayObjectEvents

export type EventMap = XchartEventMap & PixiEventMap
export type EventHandler<T extends EventType> = (e: EventMap[T]) => void


export class EventCenter {
    eventHandlers: Map<EventType, Map<EventHandler<EventType>, EventHandler<EventType>>> = new Map()
    eventQueue: EventMap[keyof EventMap][] = []
    emit<T extends EventType>(eventType: T, e: EventMap[T]) {
        const handlers = this.eventHandlers.get(e.type)
        if (!handlers) return
        handlers.forEach(handler => handler(e))
    }
    on<T extends EventType>(eventType: T, eventHandler: EventHandler<T>) {
        let handlers = this.eventHandlers.get(eventType)
        if (!handlers) {
            handlers = new Map()
            this.eventHandlers.set(eventType, handlers)
        }
        handlers!.set(eventHandler as any, eventHandler as any)
    }
    once<T extends EventType>(eventType: T, eventHandler: EventHandler<T>) {
        let handlers = this.eventHandlers.get(eventType)
        const onceEventHandler = (e: EventMap[keyof EventMap]) => {
            eventHandler(e)
            this.off(eventType, onceEventHandler)
        }
        if (!handlers) {
            handlers = new Map()
            this.eventHandlers.set(eventType, handlers)
        }
        handlers!.set(eventHandler as any, eventHandler as any)
    }
    off(eventType: keyof EventMap, eventHandler: EventHandler<EventMap[keyof EventMap]>) {
        const handlers = this.eventHandlers.get(eventType)
        if (!handlers) return
        handlers.delete(eventHandler)
    }
    // NOTE 调度需要轮询反而消耗资源，建议立即触发
    // process(){
    //     console.log('process')
    //     this.eventQueue.forEach(e => {
    //         const handlers = this.eventHandlers.get(e.type)
    //         if (!handlers) return
    //         handlers.forEach(handler => handler(e))
    //     })
    //     this.eventQueue = []
    // }
}