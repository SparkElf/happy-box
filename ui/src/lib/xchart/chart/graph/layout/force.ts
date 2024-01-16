

import type { Edge, Node } from '../Base';
import { XChart } from '../../../'
import { Layout } from './base';
import { type Point, distance, normalize, sub,length } from '../utils/vec';


export class ForceLayout extends Layout {
    ctx:{
        dom: HTMLElement,
        xchart: XChart
        gravity: number,
        friction: number
        initFriction:number
        baseLength:number
        center:Point
        repulsive:number
    }
    nodes:Node[]
    edges:Edge[]
    inited:boolean=false
    finished:boolean=false
    constructor({
        nodes,
        edges,
        ctx,
        opts
    }: {
        nodes: Node[],
        edges: Edge[],
        ctx: {
            dom: HTMLElement,
            xchart: XChart
        },
        opts: {
            gravity?: number,
            friction?: number
            baseLength?:number
            repulsive?:number
        }
    }){
        super()
        this.ctx=ctx as any
        this.edges=edges
        this.nodes=nodes
        this.ctx.gravity=opts.gravity??0.1
        this.ctx.friction=opts.friction??0.6
        this.ctx.initFriction = this.ctx.friction
        this.ctx.baseLength=opts.baseLength??30
    }

    private init(){
        //初始化和构造函数分离，方便注入和初始化解耦
        const rect = this.ctx.dom.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const center = {x:width / 2, y:height / 2}
        // Init position
        for (let i = 0; i < this.nodes.length; i++) {
            const n = this.nodes[i];
            if (!n.x || !n.y) {
                n.x = width * (Math.random() - 0.5) + center.x
                n.y = height * (Math.random() - 0.5) + center.y
            }
        }
        this.inited=true
    }

    setFixed(node:Node) {
        node.fixed=true
    }

    setUnfixed(node:Node) {
        node.fixed=false
    }
    layout({
        nodes,
        edges,
        ctx,
        opts
    }: {
        nodes: Node[],
        edges: Edge[],
        ctx: {
            dom: HTMLElement,
            xchart: XChart
        },
        opts: {
            gravity?: number,
            friction?: number
        }
    }) {
        if(!this.inited)this.init()

        for (let i = 0; i < edges.length; i++) {
            const e = edges[i];
            if (e.ignore) continue
            const p1 = e.sourceNode;
            const p2 = e.targetNode;

            //NOTE 两点向量相减 v1-v2
            const v=sub(p1,p2)
            const d=distance(p1,p2)
            normalize(v)
            //NOTE 拉近或者推开两者之间的距离 差值越大、斥力越大，速度越快 n1+=(n1-n2)*a 远了拉近 近了推开
            if(!p1.fixed){
                p1.x+=v.x*(d*this.ctx.friction)
                p1.y+=v.y*(d*this.ctx.friction)
            }
            if(!p2.fixed){
                p2.x-=v.x*(d*this.ctx.friction)
                p2.y-=v.y*(d*this.ctx.friction)
            }
        }
        // Center Gravity
        nodes.forEach(n=>{
            if(n.fixed)return
            const v=sub(this.ctx.center,n)
            n.x+=v.x*(this.ctx.gravity*this.ctx.friction)
            n.y+=v.y*(this.ctx.gravity*this.ctx.friction)
        })


        const friction=this.ctx.friction
        // Many Body Repulsive 在完全图中计算斥力
        // PENDING
        for (let i = 0; i < nodes.length; i++) {
            const n1 = nodes[i];
            for (let j = i + 1; j < nodes.length; j++) {
                const n2 = nodes[j];
                let v=sub(n1,n2)//引力方向
                let l=length(v)
                if (l === 0) {
                    // Random repulse
                    l=1
                    v.x=Math.random()-0.5
                    v.y=Math.random()-0.5
                }
                const repulsive=this.ctx.repulsive/=l
                if(!n1.fixed){
                    n1.x-=v.x*repulsive*friction//斥力
                    n1.y-=v.y*repulsive*friction
                }
                if(!n2.fixed){
                    n2.x+=v.x*repulsive*friction
                    n2.y+=v.y*repulsive*friction
                }
            }
        }


        this.ctx.friction = friction * 0.992;

        this.finished = friction < 0.01;
    }
}