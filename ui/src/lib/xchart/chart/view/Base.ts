import { IModule } from "@/lib/xchart/Base";

export abstract class IView extends IModule{
    abstract draw(...args:any):any
    abstract redraw(...args:any):any
}