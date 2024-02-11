import { quadtree } from "d3-quadtree";
import { type Node } from "../../Base";
import { Force, jiggle, type ForceContext } from "./Force";
import { QuadTree } from "@/lib/xchart/algorithm/quadtree";

export class ManyBodyForce<NodeType extends Node= Node<any>> extends Force<NodeType>{
  private strength: ((node: NodeType, nodes: NodeType[]) => number) = () => -30
  private strengths!: number[]
  minDistance = 1
  maxDistance = Infinity
  theta = 0.81
  ctx!: ForceContext<NodeType>;

  init(ctx: ForceContext<NodeType>): void {
    this.ctx = ctx;
    const nodes = ctx.nodes
    this.strengths = new Array(nodes.length);
    for (let i = 0; i < nodes.length; i++) {
      this.strengths[i] = this.strength(nodes[i], nodes)
    }
  }
  force(alpha:number): void {
    const nodes = this.ctx.nodes
    // Barnes–Hut 近似 O(n log n) 每次运行，新构造的四叉树存储当前节点位置；然后对于每个节点，计算给定节点上所有其他节点的合力。对于距离较远的节点集群，可以通过将集群视为单个较大节点来近似电荷力。 theta 参数决定近似的精度：如果四叉树单元的宽度 w 与节点到单元质心的距离 l 的比率 w / l 小于 theta，则处理给定单元中的所有节点作为单个节点而不是单独的。
    const tree = new QuadTree({ nodes: this.ctx.nodes }).visitAfter((quad) => {
      let strength = 0, q, c, weight = 0, x, y, i;

      // For internal nodes, accumulate forces from child quadrants.
      if (quad instanceof Array) {
        for (x = y = i = 0; i < 4; ++i) {
          if ((q = quad[i]) && (c = Math.abs(q.value))) {//四个象限的权重都不同
            strength += q.value, weight += c, x += c * q.x, y += c * q.y;
          }
        }
        //quad.x=(c1*q1.x+c2*q2.x+c3*q3.x+c4*q4)/(c1+c2+c3+c4)
        (quad as any).x = x / weight;
        (quad as any).y = y / weight;
      }

      // For leaf nodes, accumulate forces from coincident quadrants.
      else {
        q = quad;
        q.x = q.data.x;
        q.y = q.data.y;
        do strength += this.strengths[q.data.index];
        while (q = q.next);
      }

      quad.value = strength;
      return false
    });
    for (let i = 0; i < nodes.length; ++i) {
      const node = nodes[i]
      tree.visit((quad, x0, _, x1) => {
        if (!quad.value) return true;

        let x = quad.x - node.x,
          y = quad.y - node.y,
          w = x1 - x0,//x1-x0 * 根号2是对角线长度
          l = x * x + y * y;

        // Apply the Barnes-Hut approximation if possible.
        // Limit forces for very close nodes; randomize direction if coincident.
        if (w**2 < l*this.theta) {
          if (l < this.maxDistance) {
            if (x === 0) x = jiggle(), l += x * x;
            if (y === 0) y = jiggle(), l += y * y;
            if (l < this.minDistance) l = Math.sqrt(this.minDistance * l);
            node.vx += x * quad.value * alpha / l;
            node.vy += y * quad.value * alpha / l;
          }
          return true;
        }

        // Otherwise, process points directly.
        else if (quad.length || l >= this.maxDistance) return false;

        // Limit forces for very close nodes; randomize direction if coincident.
        if (quad.data !== node || quad.next) {
          if (x === 0) x = jiggle(), l += x * x;
          if (y === 0) y = jiggle(), l += y * y;
          if (l < this.minDistance) l = Math.sqrt(this.minDistance * l);
        }

        do if (quad.data !== node) {
          w = this.strengths[quad.data.index] * alpha / l;
          node.vx += x * w;
          node.vy += y * w;
        } while (quad = quad.next);

        return false
      });
    }
  }
  setStrength(strength: ((node: NodeType, nodes: NodeType[]) => number) | number) {
    if (typeof strength === 'function') this.strength = strength
    else this.strength = () => strength
  }
  //theta参数决定近似的精度：如果四叉树单元的宽度 w 与节点到单元质心的距离 l 的比率 w / l 小于 theta，则处理给定单元中的所有节点作为单个节点而不是单独的。
  //theta大，精度低，速度快
  setTheta(theta:number){
    this.theta = theta
    return this
  }
}
