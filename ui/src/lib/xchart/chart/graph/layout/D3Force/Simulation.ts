import { dispatch } from "d3-dispatch";
import { timer } from "d3-timer";
import type { Force, ForceContext } from "./Force";
import type { GraphEdge, GraphChartContext } from "../../Base";
import type { GraphNode } from '../../Base'
import type { D3ForceSimulationEventModel } from "../../event";
import type { EventHandler, XchartEventMap } from "@/lib/xchart/event";
export type D3ForceSimulationEventMap = XchartEventMap<D3ForceSimulationEventModel>
export class Simulation<NodeType extends GraphNode = GraphNode>{
  ctx!: ForceContext<NodeType>
  alpha: number = 1;
  velocityDecay = 0.6
  alphaMin: number = 0.001
  alphaTarget: number = 0.
  alphaDecay: number = 1 - Math.pow(this.alphaMin, 1 / 300)
  tickIteration: number = 1
  forces = new Map<string, Force>()
  initialRadius = 10
  initialAngle = Math.PI * (3 - Math.sqrt(5))
  requsetId!: number
  nodeMap: Map<string, NodeType> = new Map<string, any>()
  nodeId: (node: NodeType) => string = (node) => node.id
  setNodes(nodes: NodeType[]) {
    this.ctx.nodes = nodes
    this.initNodes()
    return this
  }
  setEdges(edges: GraphEdge<NodeType>[]) {
    this.ctx.edges = edges
    this.initEdges()
    return this
  }
  setNodeId(nodeId: (node: NodeType) => string) {
    this.nodeId = nodeId
    return this
  }
  setAlpha(alpha: number) {
    this.alpha = alpha
    return this
  }
  setAlphaTarget(alphaTarget: number) {
    this.alphaTarget = alphaTarget
    return this
  }
  setAlphaDecay(alphaDecay: number) {
    this.alphaDecay = alphaDecay
    return this
  }
  setAlphaMin(alphaMin: number) {
    this.alphaMin = alphaMin
    return this
  }
  setVelocityDecay(velocityDecay: number) {
    this.velocityDecay = velocityDecay
    return this
  }
  setTickIteration(iteration: number) {
    this.tickIteration = iteration
    return this
  }
  setForce(id: string, f: Force) {
    this.forces.set(id, f)
    return this
  }
  init(ctx: ForceContext<NodeType>) {
    this.ctx = ctx;
    this.initNodes();
    this.initEdges()
    this.initForces()

    return this
  }
  tick() {

    for (let i = 0; i < this.tickIteration; ++i) {
      this.alpha += (this.alphaTarget - this.alpha) * this.alphaDecay;

      this.forces.forEach(f => f.force(this.alpha));

      for (i = 0; i < this.ctx.nodes.length; ++i) {
        const node = this.ctx.nodes[i];
        if (node.fx == null) node.x += node.vx *= this.velocityDecay;
        else node.x = node.fx, node.vx = 0;
        if (node.fy == null) node.y += node.vy *= this.velocityDecay;
        else node.y = node.fy, node.vy = 0;
      }
    }
    this.ctx.eventCenter.emit('d3ForceSimulationTick', { type: 'd3ForceSimulationTick', simulation: this })
    if (this.alpha < this.alphaMin) {
      this.stop()
      this.ctx.eventCenter.emit('d3ForceSimulationEnd', { type: 'd3ForceSimulationEnd', simulation: this })

    }
    else window.requestAnimationFrame(()=>this.tick())
    return this;
  }
  start() {
    requestAnimationFrame(()=>this.tick())
    return this
  }
  restart() {
    this.start()
    return this
  }
  stop() {
    cancelAnimationFrame(this.requsetId)
    return this
  }
  on<T extends keyof D3ForceSimulationEventMap>(eventType: T, eventHandler: EventHandler<T>) {
    this.ctx.eventCenter.on(eventType, eventHandler)
    return this
  }
  once<T extends keyof D3ForceSimulationEventMap>(eventType: T, eventHandler: EventHandler<T>) {
    this.ctx.eventCenter.once(eventType, eventHandler)
    return this
  }
  off<T extends keyof D3ForceSimulationEventMap>(eventType: T, eventHandler: EventHandler<T>) {
    this.ctx.eventCenter.off(eventType, eventHandler)
    return this
  }
  private findNode(nodeId: string) {
    const node = this.nodeMap.get(nodeId);
    if (!node) {
      console.error(this.nodeMap, nodeId)
      throw new Error("node not found: " + nodeId);
    }
    return node;
  }
  initEdges() {

    for (let i = 0; i < this.ctx.edges.length; i++) {
      const edge = this.ctx.edges[i]
      edge.index = i;
      edge.sourceNode = this.findNode(edge.source);
      edge.targetNode = this.findNode(edge.target);
    }

  }
  initNodes() {
    this.nodeMap.clear()
    this.ctx.nodes.forEach(node => {
      this.nodeMap.set(this.nodeId(node), node)
    })

    //圆形布局
    for (var i = 0; i < this.ctx.nodes.length; ++i) {
      const node = this.ctx.nodes[i]
      node.index = i;
      if (node.fx != null) node.x = node.fx;
      if (node.fy != null) node.y = node.fy;
      if (isNaN(node.x) || isNaN(node.y)) {
        const radius = this.initialRadius * Math.sqrt(0.5 + i), angle = i * this.initialAngle;
        node.x = radius * Math.cos(angle);
        node.y = radius * Math.sin(angle);
      }
      if (isNaN(node.vx) || isNaN(node.vy)) {
        node.vx = node.vy = 0;
      }
    }
  }
  initForces() {
    this.forces.forEach(f => {
      f.init(this.ctx)
    })
  }
}