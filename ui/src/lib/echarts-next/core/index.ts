import type { ZRenderType } from 'zrender';
import  * as zrender from 'zrender';
import type { Scheduler } from './scheduler';
import { OptionModel } from './model/OptionModel';
import type SeriesModel from './model/SeriesModel';
import type GlobalModel from './model/GlobalModel';
export type ThemeSymbol = 'light' | 'dark';
export type EchartsInitOption = {
    devicePixelRatio?:number
    width?:number
    height?:number
}
export class Echarts<
    DomType extends HTMLDivElement = HTMLDivElement,
    Theme extends ThemeSymbol = ThemeSymbol,
    InitOption extends EchartsInitOption = EchartsInitOption
> {
    private _dom: DomType;
    private _theme: Theme;
    private _zr:ZRenderType;
    private _model:GlobalModel
    private _scheduler:Scheduler
    //TODO 插件系统
    private _plugins:any[]=[]
    constructor(
        dom: DomType,
        theme: Theme = 'light' as Theme,
        opts: InitOption = {} as InitOption
    ) {

        if (dom === undefined) console.error('echarts: dom is undefined');
        else this._dom = dom

        this._dom = dom;

        this._zr = zrender.init(dom, {
            renderer: 'canvas',
            devicePixelRatio: opts.devicePixelRatio,
            width: opts.width,
            height: opts.height
        });

        //TODO 移动端-插件
        //TODO 坐标系统-核心
        //TODO 兼容性-插件
        //TODO 事件、处理器优先级-核心

        this._theme = theme;

    }
    get dom(){
        return this._dom
    }
    get zrender(){
        return this._zr
    }

    setOption(option: InitOption, notMerge?: boolean, lazyUpdate?: boolean): void {

        let silent;
        let replaceMerge;

        //NOTE 首次setOption或者重置图表
        if (!this._model || notMerge) {
            const optionModel = new OptionModel();
            this._model = new GlobalModel(option, this._theme, this._locale, optionModel);
        }

        this._model.setOption(option as ECBasicOption, { replaceMerge });
        //TODO lazy update

        this.update()

        // Ensure zr refresh sychronously, and then pixel in canvas can be fetched after `setOption`.
        // NOTE convertFromPixel 可以用了
        this._zr.flush();
    }
    update(){
        //init view

    }
}