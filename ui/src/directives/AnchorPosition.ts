import { type Directive } from 'vue'
import { observeBoundingBox } from '@/utils/dom'
declare type AnchorLink = {
    elEdge: 'left' | 'bottom' | 'right' | 'top'
    targetEdge: 'left' | 'bottom' | 'right' | 'top'
    distance: string | number
}
declare type AnchorNode = {
    target: HTMLElement | undefined
    links: AnchorLink[]
    cancelObserve?: () => void
}

const m = new Map<HTMLElement, AnchorNode>()

function equal(a: AnchorNode | undefined, b: AnchorNode) {
    if (a === undefined) return false
    if (a.target !== b.target || a.links.length !== b.links.length) return false

    for (let i = 0; i < a.links.length; i++) {
        const aa = a.links[i]
        const bb = b.links[i]
        if (aa.elEdge !== bb.elEdge || aa.targetEdge !== bb.targetEdge || aa.distance !== bb.distance) return false
    }
    return true
}
/**
 * 首次绑定，将坐标系重新定位到target的左上角
 * @param el
 * @param target
 */
async function coordinateTransform(el: HTMLElement, target: HTMLElement) {
    let elBox = el.getBoundingClientRect()
    let targetBox = target.getBoundingClientRect()
    if (elBox.top !== targetBox.top || elBox.left !== targetBox.left || elBox.bottom !== targetBox.bottom || elBox.right !== targetBox.right) {
        el.attributeStyleMap.set('position', 'fixed')
        return () => {
            elBox = el.getBoundingClientRect()
            targetBox = target.getBoundingClientRect()
            el.attributeStyleMap.set('left', CSS.px(  targetBox.left-elBox.left))
            el.attributeStyleMap.set('top', CSS.px( targetBox.top - elBox.top))
        }
    }
}
/**
 * 追踪
 * @param el
 * @param target
 * @param links
 */
async function render(el: HTMLElement, target: HTMLElement, links: AnchorLink[]) {


    const elBox = el.getBoundingClientRect()
    const targetBox = target.getBoundingClientRect()
    console.log('render',el, target)
    links.forEach(link => {
        let distance = CSSNumericValue.parse(link.distance.toString()) as CSSUnitValue
        if (distance.unit === 'number') distance = CSS.px(distance.value)
        if (link.elEdge === 'left') {
            if (link.targetEdge === 'right') {
                el.attributeStyleMap.set('transform', new CSSTransformValue([
                    new CSSTranslate(new CSSMathSum(CSS.px(targetBox.width), distance), CSS.px(0))
                ]))
            }
            else if (link.targetEdge === 'left') {
                el.attributeStyleMap.set('transform', new CSSTransformValue([
                    new CSSTranslate(distance, CSS.px(0))
                ]))
            }
        }
        else if (link.elEdge === 'right') {
            if (link.targetEdge === 'left') {
                el.attributeStyleMap.set('transform', new CSSTransformValue([
                    new CSSTranslate(new CSSMathNegate(new CSSMathSum(CSS.px(elBox.width), distance)), CSS.px(0))
                ]))
            }
            else if (link.targetEdge === 'right') {
                el.attributeStyleMap.set('transform', new CSSTransformValue([
                    new CSSTranslate( new CSSMathNegate(distance), CSS.px(0))
                ]))
            }
        }
        else if (link.elEdge === 'top') {
            if (link.targetEdge === 'bottom') {
                el.attributeStyleMap.set('transform', new CSSTransformValue([
                    new CSSTranslate(CSS.px(0), new CSSMathSum(CSS.px(targetBox.height), distance))
                ]))
            }
            else if (link.targetEdge === 'top') {
                el.attributeStyleMap.set('transform', new CSSTransformValue([
                    new CSSTranslate(CSS.px(0), distance)
                ]))
            }
        }
        else if (link.elEdge === 'bottom') {
            if (link.targetEdge === 'top') {
                el.attributeStyleMap.set('transform', new CSSTransformValue([
                    new CSSTranslate(CSS.px(0), new CSSMathNegate(new CSSMathSum(CSS.px(targetBox.height), distance)))
                ]))
            }
            else if (link.targetEdge === 'bottom') {
                el.attributeStyleMap.set('transform', new CSSTransformValue([
                    new CSSTranslate(CSS.px(0), new CSSMathNegate(distance))
                ]))
            }
        }
    })
}
export const vAnchor: Directive<HTMLElement, {
    target: HTMLElement | undefined,
    links: AnchorLink[]
}> = {
    updated(el, binding, vnode, prevVnode) {
        const newNode = {
            target: binding.value.target,
            links: binding.value.links,
        } as AnchorNode
        const oldNode = m.get(el)

        if (newNode.target == null) {
            if (oldNode && oldNode.target) {
                m.delete(oldNode.target)
                oldNode?.cancelObserve?.()
            }
            return
        }

        if (equal(oldNode, newNode)) return
        m.set(el, newNode)
        coordinateTransform(el,newNode.target).then(transform=>{
            transform?.()
            render(el, newNode.target!, newNode.links)
            //newNode.cancelObserve = observeBoundingBox(newNode.target!, () => render(el, newNode.target!, newNode.links))
        })
    },
}