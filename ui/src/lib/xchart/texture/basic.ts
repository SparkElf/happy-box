
import type { Texture } from 'pixi.js'
import { IModule, type XChartContext } from '../Base'
export abstract class ITexture<Props> extends IModule{
    pixiTexture!:Texture
    ctx!:XChartContext
    props!:Props
    setProps(props:Props):void{
        this.props=Object.assign({},this.props,props)
    }
    abstract draw(props?:Props):Texture
}