import { type Directive } from 'vue';

declare type DragState = { el: HTMLElement, x?: number, y?: number, translate?: CSSTranslate, clean: () => void, animationId?: number | null }
const draggableMap = new WeakMap<HTMLElement, DragState>();

export const vDraggable: Directive<HTMLElement> = {
    mounted: (el, binding) => {
        if (draggableMap.has(el)) return

        function onPointerMove(e: PointerEvent) {
            //console.log(el.getBoundingClientRect())
            e.preventDefault()
            const state = draggableMap.get(el)!
            const transform = el.computedStyleMap().get('transform') as CSSTransformValue
            for (let i = 0; i < (transform as CSSTransformValue).length; i++) {
                const translate = (transform as CSSTransformValue)[i]
                if (translate instanceof CSSTranslate) {
                    if (state.translate === undefined) {
                        (transform as CSSTransformValue)[i] = new CSSTranslate(CSS.px(e.clientX - state.x!), CSS.px(e.clientY - state.y!), translate.z)
                    } else {
                        (transform as CSSTransformValue)[i] = new CSSTranslate(
                            new CSSMathSum(CSS.px(e.clientX - state.x!), state.translate.x),
                            new CSSMathSum(CSS.px(e.clientY - state.y!), state.translate.y),
                            translate.z)
                    }
                    break
                }
            }

            el.attributeStyleMap.set('transform', transform)
        }

        function onPointerDown(e: PointerEvent) {
            e.preventDefault()
            const state = draggableMap.get(el)!
            state.x = e.clientX
            state.y = e.clientY
            const transform = el.computedStyleMap().get('transform') as CSSTransformValue
            for (let i = 0; i < transform.length; i++) {
                if (transform[i] instanceof CSSTranslate) {
                    state.translate = transform[i] as CSSTranslate
                    break
                }
            }
            el.setPointerCapture(e.pointerId)
            el.addEventListener('pointermove', onPointerMove)
        }
        function onPointerUp(e: PointerEvent) {
            el.removeEventListener('pointermove', onPointerMove)
            el.releasePointerCapture(e.pointerId)
        }
        draggableMap.set(el, {
            el, clean: () => {
                el.removeEventListener('pointerdown', onPointerDown)
                el.removeEventListener('pointerup', onPointerDown)
            }
        })
        el.addEventListener('pointerdown', onPointerDown)
        el.addEventListener('pointerup', onPointerUp)
    },


    //updated: (el, { value = {} }) => draggableMap.get(el)!.update(value),

    unmounted: (el) => {
        draggableMap.get(el)!.clean();
        draggableMap.delete(el);
    },
};
