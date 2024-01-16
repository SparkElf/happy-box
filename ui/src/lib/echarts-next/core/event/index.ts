export type ElementEventSymbol = 'mousedown' | 'mouseup' | 'click' | 'mousemove' | 'rightclick' | 'dbclick' | 'mouseover' | 'mouseout' | 'mouseenter'
export type ActionEventSymbol = 'frame' | 'legendselectedchange'
export type EventSymbol = ElementEventSymbol | ActionEventSymbol

export type BaseEventModel<EventSymbol extends string = any, Payload = {}> = {
    type: EventSymbol
    [key: string]: any
} & Payload
//TODO 更具体的ActionEvent
/**
 * 任意自定义事件
 */
export type ActionEventModel = BaseEventModel<ActionEventSymbol, {
}>
/**
 * 图表元素事件
 */
export type ElementEventModel = BaseEventModel<ElementEventSymbol, {
    componentType?: string
    componentIndex?: number
    seriesIndex?: number
    //相对容器的像素坐标
    offsetX: number,
    offsetY: number,
    //鼠标滚轮
    wheelDelta: number,
    stop: (e: ElementEventModel) => void
}>
export type EventModel = ActionEventModel | ElementEventModel

export type EventHandler<T extends BaseEventModel> = (e: T) => void
//TODO ? 编写更具体的事件类型
export type BaseEventModelMap = {
    [key: string]: BaseEventModel
}
export type EventModelMap = {
    [key in keyof ElementEventSymbol]: ElementEventModel
} & {
        [key in keyof ActionEventSymbol]: ActionEventModel
    }

//NOTE 事件处理中间件建议无状态化，只做接口 执行顺序从上到下
/**
 * 事件处理中间件
 */
export interface EventMiddleware<T extends BaseEventModel = EventModel> {
    capture: (e: T) => boolean
    beforeTrigger?: (e: T) => void
    afterTrigger?: (e: T) => void
}
/**
 * 事件中心
 */
export class EventCenter<T extends { [key: string]: BaseEventModel } = EventModelMap>{
    middlewares: EventMiddleware[] = []
    //TODO ? 区分两种不同的事件
    eventHandlers: Map<keyof T, EventHandler<T[keyof T]>[]> = new Map()
    eventQueue: T[keyof T][] = []
    //NOTE 外部可以 emit mousedown事件吗 ， 方便mock交互
    //NOTE 调度串行设计，但是handler本身可以异步
    emit(eventType: keyof T, e: T[keyof T]) {
        this.eventQueue.push(e)
    }
    on(eventType: keyof T, eventHandler: EventHandler<T[keyof T]>) {
        const handlers = this.eventHandlers.get(eventType)
        if (!handlers) this.eventHandlers.set(eventType, [eventHandler])
        else handlers.push(eventHandler)
    }
    once(eventType: keyof T, eventHandler: EventHandler<T[keyof T]>) {
        const handlers = this.eventHandlers.get(eventType)
        const onceEventHandler = (e: T[keyof T]) => {
            eventHandler(e)
            this.off(eventType, onceEventHandler)
        }
        if (!handlers) this.eventHandlers.set(eventType, [onceEventHandler])
        else handlers.push(onceEventHandler)
    }
    off(eventType: keyof T, eventHandler: EventHandler<T[keyof T]>) {
        //TODO 优化处理速度
        const handlers = this.eventHandlers.get(eventType)
        if (!handlers) return
        const idx = handlers.findIndex(h => h === eventHandler)
        if (idx === -1) return
        handlers.splice(idx, 1)
    }
    /**
     * 调度器调用的接口
     */
    process() {
        //TODO 优化O^2的处理速度
        this.eventQueue.forEach(e => {
            const handlers = this.eventHandlers.get(e.type)
            if (!handlers) return
            const middlewares = this.middlewares.filter(middleware => middleware.capture(e))
            middlewares.forEach(middleware => middleware.beforeTrigger?.(e))
            handlers.forEach(handler => handler(e))
            middlewares.forEach(middleware => middleware.afterTrigger?.(e))
        })
    }
}