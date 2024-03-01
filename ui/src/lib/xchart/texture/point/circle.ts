import { Graphics, type ColorSource, type ILineStyleOptions, type Resource, type Texture, SCALE_MODES } from "pixi.js";
import type { XChartContext } from "../../Base";
import { ITexture } from "../basic";

declare type CircleTextureProps ={
    radius?:number
    border?:ILineStyleOptions
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

    draw(): Texture<Resource> {
        const circle = new Graphics()
        circle.beginFill(0x000000)
        if(this.props.border)circle.lineStyle(this.props.border!)
        circle.drawCircle(0,0,this.props.radius!)
        circle.endFill()
        this.ctx.pixiApp.renderer.options.antialias=true
        this.ctx.pixiApp.renderer.options.resolution=window.devicePixelRatio
        this.ctx.pixiApp.renderer.options.autoDensity=true
        this.pixiTexture=this.ctx.pixiApp.renderer.generateTexture(circle,{scaleMode: SCALE_MODES.LINEAR })
        return this.pixiTexture
    }
    getTexture(): Texture<Resource> {
        if(!this.pixiTexture)this.draw()
        return this.pixiTexture
    }
}