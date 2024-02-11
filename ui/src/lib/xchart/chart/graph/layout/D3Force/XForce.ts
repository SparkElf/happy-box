
import { Force, type ForceContext } from "./Force";
import { type Node } from "../../Base";
export class ForceX<NodeTextureProps> extends Force{

    ctx!:ForceContext<any>
    strengths!: any[]
    xz!: any[]
    //力作用点的位置
    x!:(node:Node<NodeTextureProps>)=>number
    strength!:(node:Node<NodeTextureProps>)=>number
    constructor(x?:(node:Node<NodeTextureProps>)=>number) {
        super()
        this.setX(x??0)
        this.setStrength(0.1)
    }

    init(ctx:ForceContext<any>){
        this.ctx=ctx
        const nodes=this.ctx.nodes
        let i, n = nodes.length;
        this.strengths = new Array(n);
        this.xz = new Array(n);
        for (i = 0; i < n; ++i) {
          this.strengths[i] = isNaN(this.xz[i] = this.x(nodes[i])) ? 0 : this.strength(nodes[i]);
        }
        return this
    }
    force(alpha:any) {
        for (var i = 0, n = this.ctx.nodes.length, node; i < n; ++i) {
          node = this.ctx.nodes[i], node.vx += (this.xz[i] - node.x) * this.strengths[i] * alpha;
        }
    }
    setX(x:number|((node:Node<NodeTextureProps>)=>number)){
        this.x=x instanceof Number?()=>x:x as any
    }
    setStrength(strength:number|((node:Node<NodeTextureProps>)=>number)) {
        this.strength=strength instanceof Number?()=>strength:strength as any
    }

}