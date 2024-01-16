import type { LinearGradientObject } from "zrender/lib/graphic/LinearGradient";
import type { RadialGradientObject } from "zrender/lib/graphic/RadialGradient";
import type { Merge } from "../utils/type";

export type ColorStringSymbol = `rgba(${number},${number},${number},${number})` | `rgb(${number},${number},${number})` | `#${number | string}${number | string}${number | string}${number | string}${number | string}${number | string}`
export type Color = ColorStringSymbol | LinearGradientObject | RadialGradientObject;
export type LineShapeTypeSymbol = 'solid' | 'dotted' | 'dashed';
export type LineStyleOption = {
    width?: number
    color?: Color
    opacity?: number
    type?: LineShapeTypeSymbol
    cap?: CanvasLineCap
    join?: CanvasLineJoin
    dashOffset?: number
    miterLimit?: number
}
export type ItemSymbol = 'image' | 'triangle' | 'diamond' | 'pin' | 'arrow' | 'line' | 'rect' | 'roundRect' | 'square' | 'circle'
export type ItemStyleOption = {
    color?: Color
    opacity?: number
    symbol?: ItemSymbol
    symbolSize?: number
    borderColor?: string
    borderWidth?: number
    borderType?: LineShapeTypeSymbol
    borderDashOffset?: number
    borderRadius?: number | number[]
}
export type FontWeight = 'normal' | 'bold' | 'bolder' | 'lighter' | number;
export type LayoutOrientSymbol = 'vertical' | 'horizontal';
export type HorizontalAlignSymbol = 'left' | 'center' | 'right';
export type VerticalAlignSymbol = 'top' | 'middle' | 'bottom';

export type FontShape = 'normal' | 'italic' | 'oblique';
export type ImageLike = HTMLImageElement | HTMLCanvasElement | HTMLVideoElement
export type TextStyleOption = {
    color?: string
    fontStyle?: FontShape
    fontWeight?: FontWeight
    fontFamily?: string
    fontSize?: number | string
    align?: HorizontalAlignSymbol
    verticalAlign?: VerticalAlignSymbol

    opacity?: number

    lineHeight?: number
    backgroundColor?: Color | {
        image: ImageLike | string
    }
    borderColor?: string
    borderWidth?: number
    borderType?: LineShapeTypeSymbol
    borderDashOffset?: number
    borderRadius?: number | number[]
    padding?: number | number[]

    width?: number | string// Percent
    height?: number
    textBorderColor?: string
    textBorderWidth?: number
    textBorderType?: LineShapeTypeSymbol
    textBorderDashOffset?: number

    textShadowBlur?: number
    textShadowColor?: string
    textShadowOffsetX?: number
    textShadowOffsetY?: number

    tag?: string
}
export type TextPositionSymbol = 'left' | 'right' | 'top' | 'bottom' | 'inside'
    | 'insideLeft' | 'insideRight' | 'insideTop' | 'insideBottom'
    | 'insideTopLeft' | 'insideTopRight'| 'insideBottomLeft' | 'insideBottomRight';
export type LabelOption = Merge<TextStyleOption, {
    /**
    * If show label
    */
    show?: boolean
    // TODO: TYPE More specified 'inside', 'insideTop'....
    // x, y can be both percent string or number px.
    position?: TextPositionSymbol
    distance?: number
    rotate?: number
    offset?: number[]

    /**
     * Min margin between labels. Used when label has layout.
     */
    // It's minMargin instead of margin is for not breaking the previous code using margin.
    margin?: number

    overflow?: 'break' | 'breakAll' | 'truncate' | 'none'
    ellipsis?: string

    silent?: boolean
    precision?: number | 'auto'
    valueAnimation?: boolean
}>
export type EmphasisFocusSymbol='none' | 'self' | 'series';