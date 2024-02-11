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

    draw(props?:CircleTextureProps): Texture<Resource> {
        if(props)this.setProps(props)
        const circle = new Graphics()
        circle.beginFill(0x000000)
        circle.lineStyle(this.props.border!)
        circle.drawCircle(0,0,this.props.radius!)
        circle.endFill()
        this.pixiTexture=this.ctx.pixiApp.renderer.generateTexture(circle,{scaleMode: SCALE_MODES.LINEAR,resolution:2})
        return this.pixiTexture
    }
    getTexture(): Texture<Resource> {
        if(!this.pixiTexture)this.draw(this.props)
        return this.pixiTexture
    }
}