import { Force, jiggle, type ForceContext } from "./Force";
import { type Node } from "../../Base";
import { QuadNodeOperator, QuadTree } from "@/lib/xchart/algorithm/quadtree";
export class CollideForce<NodeType extends Node<any> = Node<any>> extends Force<NodeType>{
  ctx!: ForceContext<NodeType>
  radii!: number[]
  radius: (node: NodeType, nodes: NodeType[]) => number = () => 1
  strength: (node: NodeType, nodes: NodeType[]) => number = () => 1
  iteration = 1
  x: (node: NodeType) => number = (node) => (node.x + node.vx)
  y: (node: NodeType) => number = (node) => (node.y + node.vy)
  init(ctx: ForceContext<NodeType>): this {
    this.ctx = ctx
    const nodes = this.ctx.nodes
    this.radii = new Array(nodes.length);
    for (let i = 0; i < nodes.length; ++i) {
      const node = nodes[i]
      this.radii[node.index] = this.radius(node, nodes)
    }
    return this
  }
  force(args: any): void {
    const nodes = this.ctx.nodes
    const n = nodes.length


    for (let k = 0; k < this.iteration; ++k) {

      const tree = new QuadTree({ nodes, op: new QuadNodeOperator({ x: this.x, y: this.y }) }).visitAfter((quad) => {
        if (quad.data) return quad.r = this.radii[quad.data.index] as any;
        for (var i = quad.r = 0; i < 4; ++i) {
          if (quad[i] && quad[i].r > quad.r) {
            quad.r = quad[i].r;
          }
        }
        return false
      });
      for (let i = 0; i < n; ++i) {
        let node = nodes[i];
        let ri = this.radii[node.index], ri2 = ri * ri;
        let xi = node.x + node.vx;
        let yi = node.y + node.vy;
        tree.visit((quad, x0, y0, x1, y1) => {
          let data = quad.data, rj = quad.r, r = ri + rj;
          if (data) {
            if (data.index > node.index) {
              var x = xi - data.x - data.vx,
                y = yi - data.y - data.vy,
                l = x * x + y * y;
              if (l < r * r) {
                if (x === 0) x = jiggle(), l += x * x;
                if (y === 0) y = jiggle(), l += y * y;
                l = (r - (l = Math.sqrt(l))) / l * this.strength(data, nodes);
                node.vx += (x *= l) * (r = (rj *= rj) / (ri2 + rj));
                node.vy += (y *= l) * r;
                data.vx -= x * (r = 1 - r);
                data.vy -= y * r;
              }
            }
            return false;
          }
          return x0 > xi + r || x1 < xi - r || y0 > yi + r || y1 < yi - r;
        });
      }

    }

  }
  setRadius(radius: number | ((node: NodeType, nodes: NodeType[]) => number)) {
    if (typeof radius === 'function') this.radius = radius
    else this.radius = () => radius
  }
  setIteration(iteration: number) {
    this.iteration = iteration
  }
  setX(x: (node: NodeType) => number) {
    this.x = x
  }
  setY(y: (node: NodeType) => number) {
    this.y = y
  }
}
