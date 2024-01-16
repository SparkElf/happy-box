export type ColorStringSymbol = `rgba(${number},${number},${number},${number})` | `rgb(${number},${number},${number})` | `#${number | string}${number | string}${number | string}${number | string}${number | string}${number | string}`
//TODO Other Color Model?
export type Color=ColorStringSymbol
