import { Graphics, Texture, type ColorSource, type StrokeStyle } from "pixi.js";
import type { XChartContext } from "../../Base";
import { ITexture } from "../basic";

declare type CircleTextureProps ={
    radius?:number
    border?:StrokeStyle
    color?:ColorSource
    img?:Texture
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
        console.log(this.props,props)
        if(ctx)this.init(ctx)
    }
    init(ctx: XChartContext): void {
        this.ctx=ctx
    }

    draw(): Texture {
        //console.log(this.props.img)
        const r=this.props.radius!
        const circle = new Graphics().circle(0,0,r).fill(0x000000)

        if(this.props.border)circle.stroke(this.props.border!)
        if(this.props.img)circle.texture(this.props.img,0xffffff,-r,-r,2*r,2*r)
        this.pixiTexture=this.ctx.pixiApp.renderer.generateTexture({target:circle})
        return this.pixiTexture
    }
    getTexture(): Texture {
        if(!this.pixiTexture)this.draw()
        return this.pixiTexture
    }
}