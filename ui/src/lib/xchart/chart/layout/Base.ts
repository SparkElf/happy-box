import { IModule } from "@/lib/xchart/Base";

export abstract class Layout<LayoutProps> extends IModule{
    abstract layout(args:any):void
}