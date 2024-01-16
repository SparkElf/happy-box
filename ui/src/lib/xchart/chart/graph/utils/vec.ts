export interface Point {
    x:number
    y:number
}
export function sub(p1:Point,p2:Point){
    return {
        x:p1.x-p2.x,
        y:p1.y-p2.y
    }
}
export function distance(p1:Point,p2:Point){
    return Math.sqrt((p1.x-p2.x)**2+(p1.y-p2.y)**2)
}
export function length(p:Point){
    return Math.sqrt(p.x**2+p.y**2)
}
/**
 * inplace
 */
export function normalize(p:Point){
    const l=length(p)
    if(l!==0){
        p.x/=l
        p.y/=l
    }
    return p
}
