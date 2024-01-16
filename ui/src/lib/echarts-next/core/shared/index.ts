
import { EventCenter } from "../event";
import type { ComponentModel } from "../model/ComponentModel";
import type SeriesModel from "../model/SeriesModel";

//NOTE 简陋的单例实现
export const eventCenter=new EventCenter();
export const seriesModelClassMap=new Map<string,SeriesModel>()
export const componentModelClassMap=new Map<string,ComponentModel>()