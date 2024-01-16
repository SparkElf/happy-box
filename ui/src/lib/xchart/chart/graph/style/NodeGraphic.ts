import type { Color } from "../../style/Base"


export type EdgeStyle={
    color:Color
    width:number
    end:'triangle'|'arrow'|'none'
    start:'triangle'|'arrow'|'none'
    type:'dashed'|'solid'
    curveness:number
}
export interface Border{
    borderColor:Color
    borderWidth:number
    borderType:'dashed'|'solid'
    borderRadius:number
    drawBorder:()=>void
}
export interface NodeSymbol{
    draw:(node:Node)=>void
}
export class Rect implements Border{
    width:number
    height:number
    fill:Color
    opacity:number

}