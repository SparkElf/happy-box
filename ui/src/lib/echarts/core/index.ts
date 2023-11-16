import type { ZRenderType } from 'zrender';
import  * as zrender from 'zrender';
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
    constructor(
        dom: DomType,
        theme: Theme = 'light' as Theme,
        opts: InitOption = {} as InitOption
    ) {

        if (dom === undefined) console.error('echarts: dom is undefined');
        else this._dom = dom

        this._dom = dom;

        let defaultRenderer = 'canvas';
        let defaultCoarsePointer: 'auto' | boolean = 'auto';
        let defaultUseDirtyRect = false;

        this._zr = zrender.init(dom, {
            renderer: 'canvas',
            devicePixelRatio: opts.devicePixelRatio,
            width: opts.width,
            height: opts.height
        });

        //TODO 移动端-插件
        //TODO 坐标系统-核心
        //TODO 兼容性-插件

        theme && backwardCompat(theme as ECUnitOption, true);

        this._theme = theme;

        this._locale = createLocaleObject(opts.locale || SYSTEM_LANG);

        this._coordSysMgr = new CoordinateSystemManager();

        const api = this._api = createExtensionAPI(this);

        // Sort on demand
        function prioritySortFunc(a: StageHandlerInternal, b: StageHandlerInternal): number {
            return a.__prio - b.__prio;
        }
        timsort(visualFuncs, prioritySortFunc);
        timsort(dataProcessorFuncs, prioritySortFunc);

        this._scheduler = new Scheduler(this, api, dataProcessorFuncs, visualFuncs);

        this._messageCenter = new MessageCenter();

        // Init mouse events
        this._initEvents();

        // In case some people write `window.onresize = chart.resize`
        this.resize = bind(this.resize, this);

        zr.animation.on('frame', this._onframe, this);

        bindRenderedEvent(zr, this);

        bindMouseEvent(zr, this);

        // ECharts instance can be used as value.
        setAsPrimitive(this);
    }
    get dom(){
        return this._dom
    }
    get zrender(){
        return this._zr
    }
}