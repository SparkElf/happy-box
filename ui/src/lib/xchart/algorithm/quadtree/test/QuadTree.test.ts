import { it, describe, expect } from 'vitest'
import {type Node} from '@/lib/xchart/chart/graph/Base'
import { QuadTree } from '../index';
import {quadtree} from 'd3'
function generateNodes(nodesNum = 50) {
    const nodes: Node[] = []
    for (let i = 0; i < nodesNum; i++) {
        const node = { props: {} } as any
        node.x = Math.random() * 800;
        node.y = Math.random() * 800;
        node.props.radius = 10;
        node.id = i.toString();
        nodes.push(node);
    }
    return nodes
}
function verifyTree(t1:QuadTree,t2:ReturnType<typeof quadtree<Node>>){
    expect(t1.x0).toBe((t2 as any)._x0)
    expect(t1.x1).toBe((t2 as any)._x1)
    expect(t1.y0).toBe((t2 as any)._y0)
    expect(t1.y1).toBe((t2 as any)._y1)
    const res1=[] as any[],res2=[] as any[]
    t1.visit((node,x0,y0,x1,y1)=>{
        res1.push({node,x0,y0,x1,y1})
        return false
    })
    t2.visit((node,x0,y0,x1,y1)=>{
        res2.push({node,x0,y0,x1,y1})
        return false
    })
    expect(res1.length).toEqual(res2.length)
    for(let i=0;i<res1.length;i++){
        const node1=res1[i],node2=res2[i]
       
        expect(node1.x0).toEqual(node2.x0)
        expect(node1.x1).toEqual(node2.x1)
        expect(node1.y0).toEqual(node2.y0)
        expect(node1.y1).toEqual(node2.y1)
        if(node1.node instanceof Array){
            for(let i=0;i<4;i++){
                if(node1==undefined||node2==undefined){
                    expect(node1).toBe(undefined)
                    expect(node2).toBe(undefined)
                }
            }
        }
        else{
            expect(node1.node.data.id).toEqual(node2.node.data.id)
            expect(node1.node.data.x).toEqual(node2.node.data.x)
            expect(node1.node.data.y).toEqual(node2.node.data.y)
        }
    }
}
describe('QuadTree',()=>{
    it.skip('visit',()=>{
        const nodes=generateNodes()
        const t1=new QuadTree({nodes}),t2=quadtree(nodes,(node)=>node.x,(node)=>node.y)
        t1.root=t2.root()
        verifyTree(t1,t2)
    })
    it.skip('init',()=>{
        const t1=new QuadTree<Node>({nodes:[]}),t2=quadtree<Node>([],(node)=>node.x,(node)=>node.y)
        verifyTree(t1,t2)
        t1.add({x:0,y:0,id:'0'} as any)
        t2.add({x:0,y:0,id:'0'} as any)
        verifyTree(t1,t2)
    })
    it.skip('add',()=>{
        const nodes=generateNodes(6)
        const t1=new QuadTree<Node>({nodes:[]}),t2=quadtree<Node>([],(node)=>node.x,(node)=>node.y)
        for(let i=0;i<nodes.length;i++){
            t1.add(nodes[i])
            t2.add(nodes[i])
            verifyTree(t1,t2)
        }
    })
    it.skip('addall',()=>{
        const nodes=generateNodes()
        const t1=new QuadTree({nodes}),t2=quadtree(nodes,(node)=>node.x,(node)=>node.y)
        verifyTree(t1,t2)
    })
})