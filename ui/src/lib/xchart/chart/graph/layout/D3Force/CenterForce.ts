import { type Node } from "../../Base";
import { Force, type ForceContext } from "./Force";
/**
 * 中心力均匀地平移节点，以便所有节点的平均位置（如果所有节点具有相同的权重，则为质心）位于给定位置 ⟨x,y⟩。该力会修改每个应用程序上节点的位置；它不会修改速度，因为这样做通常会导致节点超调并围绕所需中心振荡。该力有助于将节点保持在视口的中心，并且与位置力不同，它不会扭曲它们的相对位置。
 */
export class CenterForce<NodeType extends Node<any> = Node<any>> extends Force<NodeType>{
  ctx!: ForceContext<NodeType>;
  x=0
  y= 0
  strength=1
  constructor(props?:{x?:number,y?:number,strength?:number}){
    super()
    if(props){
      if(props.x)this.x=props.x
      if(props.y)this.y=props.y
      if(props.strength)this.strength=props.strength
    }
  }
  init(ctx: ForceContext<NodeType>): void {
    this.ctx = ctx
  }
  force(args: any): void {
    const nodes=this.ctx.nodes

    let sx = 0,sy = 0;

    for (let i = 0; i < nodes.length; ++i) {
      const node = nodes[i]
      sx += node.x, sy += node.y;
    }
    sx = (sx / nodes.length - this.x) * this.strength, sy = (sy / nodes.length - this.y) * this.strength
    for (let i = 0; i < nodes.length; ++i) {
      const node = nodes[i]
      node.x -= sx, node.y -= sy;
    }
  }
  setCenter(x:number,y:number){
    this.x=x
    this.y=y
    return this
  }
  setX(x: number) {
    this.x = x
    return this
  }
  setY(y: number) {
    this.y = y
    return this
  }
  setStrength(strength: number) {
    this.strength = strength
    return this
  }
}
