import { Graphics, type ColorSource, type StrokeStyle, type Texture } from "pixi.js";
import type { XChartContext } from "../../Base";
import { ITexture } from "../basic";

declare type CircleTextureProps ={
    radius?:number
    border?:StrokeStyle
    color?:ColorSource

}
const DEFAULT_CIRCLETEXTURE_PROPS={
    radius:20,
    color:0x000000
}
export class CircleTexture extends ITexture<CircleTextureProps>{
    props:CircleTextureProps
    constructor(props?:CircleTextureProps,ctx?:XChartContext) {
        super()
        this.props=Object.assign({},DEFAULT_CIRCLETEXTURE_PROPS,props)
        if(ctx)this.init(ctx)
    }
    init(ctx: XChartContext): void {
        this.ctx=ctx
    }

    draw(): Texture {
        const circle = new Graphics().circle(0,0,this.props.radius!).fill(0x000000)

        if(this.props.border)circle.stroke(this.props.border!)

        this.pixiTexture=this.ctx.pixiApp.renderer.generateTexture({target:circle})
        return this.pixiTexture
    }
    getTexture(): Texture {
        if(!this.pixiTexture)this.draw()
        return this.pixiTexture
    }
}