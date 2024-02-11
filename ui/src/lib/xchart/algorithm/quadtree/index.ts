
export class QuadNodeOperator {
    x: (node: any) => number
    y: (node: any) => number
    constructor(args?:{ x: (node: any) => number, y: (node: any) => number }) {
        args??={x:function(node){return node.x},y:function(node){return node.y}}
        this.x = args.x
        this.y = args.y
    }
}
export type QuadNode=Array<QuadNode|{data:Node}>
export class QuadTree<Node = any> {
    //(x0,y0)左下角 (x1,y1)右上角
    op: QuadNodeOperator
    x0: number=NaN
    y0: number=NaN
    x1: number=NaN
    y1: number=NaN
    root: any
    constructor({
        nodes,
        op = new QuadNodeOperator()
    }:{nodes?:Node[],op?:QuadNodeOperator}) {
        this.op = op
        if (nodes) this.addAll(nodes)
    }
    addAll(nodes: Node[]) {
        const n = nodes.length
        let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity
        let x, y
        // Compute the points and their extent.
        for (let i = 0; i < nodes.length; ++i) {
            if (isNaN(x = this.op.x(nodes[i])) || isNaN(y = this.op.y(nodes[i]))) continue;
            if (x < x0) x0 = x;
            if (x > x1) x1 = x;
            if (y < y0) y0 = y;
            if (y > y1) y1 = y;
        }

        // If there were no (valid) points, abort.
        if (x0 > x1 || y0 > y1) return this;

        // Expand the tree to cover the new points.
        this.cover(x0, y0).cover(x1, y1);

        // Add the new points.
        for (let i = 0; i < n; ++i) {
            this.add(nodes[i]);
        }

        return this;
    }
    add(node: Node,lazyCover?:boolean) {
        const x=this.op.x(node),y=this.op.y(node)
        if(!lazyCover)this.cover(x,y)
        if (isNaN(x) || isNaN(y)) return this; // ignore invalid points

        let parent, cur = this.root, leaf = { data: node } as { data: any, next?: any }

        // If the tree is empty, initialize the root as a leaf.
        if (!cur) {
            this.root = leaf;
            return this
        }
        let { x0, y0, x1, y1 } = this
        let xm, ym, right, bottom, i, j
        // Find the existing leaf for the new point, or add it.
        while (cur.length) {
            if (right = x >= (xm = (x0 + x1) / 2)?1:0) x0 = xm; else x1 = xm;
            if (bottom = y >= (ym = (y0 + y1) / 2)?1:0) y0 = ym; else y1 = ym;
            //i的含义：四叉树非叶子节点是一个数组，0：左上 1：右上 2：左下 3：右下
            if (parent = cur, !(cur = cur[i = bottom << 1 | right])) {
                parent[i] = leaf
                return this
            }
        }

        // Is the new point is exactly coincident with the existing point? 如果找到的位置是当前节点
        let xp = this.op.x(cur.data)
        let yp = this.op.y(cur.data)
        if (x === xp && y === yp) {
            leaf.next = cur
            if (parent) parent[i!] = leaf
            else this.root = leaf
            return this
        }

        // Otherwise, split the leaf node until the old and new point are separated.
        do {
            // if (parent) parent[i!] = new Array(4)
            // else parent = this.root = new Array(4)
            parent = parent ? parent[i!] = new Array(4) : this.root = new Array(4);
            if (right = x >= (xm = (x0 + x1) / 2)?1:0) x0 = xm; else x1 = xm;
            if (bottom = y >= (ym = (y0 + y1) / 2)?1:0) y0 = ym; else y1 = ym;
        } while ((i = bottom << 1 | right) === (j = (yp >= ym) as any << 1 | (xp >= xm) as any));

        parent[j] = cur
        parent[i] = leaf
        return this
    }
    cover(x: number, y: number) {
        if (isNaN(x) || isNaN(y)) return this; // ignore invalid points
        let { x0, y0, x1, y1 } = this

        // If the quadtree has no extent, initialize them.with[x0,y0][x0+1,y0+1]
        // Integer extent are necessary so that if we later double the extent,
        // the existing quadrant boundaries don’t change due to floating point error!
        if (isNaN(x0)) {
            x1 = (x0 = Math.floor(x)) + 1;
            y1 = (y0 = Math.floor(y)) + 1;
        }

        // Otherwise, double repeatedly to cover.
        else {
            let z = x1 - x0 || 1,
                cur = this.root,
                parent, i;

            while (x0 > x || x >= x1 || y0 > y || y >= y1) {//没覆盖
                i = (y < y0 as any) << 1 | (x < x0 as any);
                parent = new Array(4)
                parent[i] = cur
                cur = parent
                z *= 2;
                switch (i) {
                    case 0: x1 = x0 + z, y1 = y0 + z; break;
                    case 1: x0 = x1 - z, y1 = y0 + z; break;
                    case 2: x1 = x0 + z, y0 = y1 - z; break;
                    case 3: x0 = x1 - z, y0 = y1 - z; break;
                }
            }

            if (this.root && this.root.length) this.root = cur;
        }

        this.x0 = x0;
        this.y0 = y0;
        this.x1 = x1;
        this.y1 = y1;
        return this;
    }
    //callback 返回值是是否跳过它的子节点
    visit(callback: (quadnode:any,x0:number,y0:number,x1:number,y1:number)=>boolean) {
        let quads = [] as {
            node: any
            x0: number
            y0: number
            x1: number
            y1: number
        }[]
        let cur = this.root
        let q, child
        let { x0, y0, x1, y1 } = this
        if (cur) quads.push({ node: cur, x0, y0, x1, y1 });
        while (q = quads.pop()) {
            if (!callback(cur = q.node, x0 = q.x0, y0 = q.y0, x1 = q.x1, y1 = q.y1) && cur.length) {
                const xm = (x0 + x1) / 2, ym = (y0 + y1) / 2;
                if (child = cur[3]) quads.push({ node: child, x0: xm, y0: ym, x1, y1 });
                if (child = cur[2]) quads.push({ node: child, x0, y0: ym, x1: xm, y1 });
                if (child = cur[1]) quads.push({ node: child, x0: xm, y0, x1, y1: ym });
                if (child = cur[0]) quads.push({ node: child, x0, y0, x1: xm, y1: ym });
            }
        }
        return this;
    }
    find(x: number, y: number, radius: number) {
        let data,_x0 = this.x0,_y0 = this.y0,_x1 = this.x1,_y1 = this.y1,
            x0, y0, x1, y1,
            quads = [] as { node: Node, x0: number, y0: number, x1: number, y1: number }[],
            cur = this.root,
            q, i;

        if (cur) quads.push({ node: cur, x0: _x0, y0: _y0, x1: _x1, y1: _y1 });
        if (radius == null) radius = Infinity;
        else {
            _x0 = x - radius, _y0 = y - radius;
            _x1 = x + radius, _y1 = y + radius;
            radius *= radius;
        }

        while (q = quads.pop()) {
            // Stop searching if this quadrant can’t contain a closer node.
            if (!(cur = q.node)
                || (x0 = q.x0) > _x1
                || (y0 = q.y0) > _y1
                || (x1 = q.x1) < _x0
                || (y1 = q.y1) < _y0) continue;

            // Bisect the current quadrant.
            if (cur.length) {
                var xm = (x0 + x1) / 2,
                    ym = (y0 + y1) / 2;

                quads.push(
                    { node: cur[3], x0: xm, y0: ym, x1, y1 },
                    { node: cur[2], x0, y0: ym, x1: xm, y1 },
                    { node: cur[1], x0: xm, y0, x1, y1: ym },
                    { node: cur[0], x0, y0, x1: xm, y1: ym }
                );

                // Visit the closest quadrant first.
                if (i = (y >= ym as any) << 1 | (x >= xm as any)) {
                    q = quads[quads.length - 1];
                    quads[quads.length - 1] = quads[quads.length - 1 - i];
                    quads[quads.length - 1 - i] = q;
                }
            }

            // Visit this point. (Visiting coincident points isn’t necessary!)
            else {
                let dx = x - this.op.x(cur.data),
                    dy = y - this.op.y(cur.data),
                    d2 = dx * dx + dy * dy;
                if (d2 < radius) {
                    let d = Math.sqrt(radius = d2);
                    _x0 = x - d, _y0 = y - d;
                    _x1 = x + d, _y1 = y + d;
                    data = cur.data;//leaf:{data:node}
                }
            }
        }

        return data;
    }
    remove(node: Node) {
        let x: number, y: number
        if (isNaN(x = this.op.x(node)) || isNaN(y = this.op.y(node))) return this; // ignore invalid points

        let parent,
            cur = this.root,
            retainer,
            previous,
            next,
            { x0, y0, x1, y1 } = this,
            xm,
            ym,
            right,
            bottom,
            i,
            j;

        // If the tree is empty, initialize the root as a leaf.
        if (!cur) return this;

        // Find the leaf node for the point.
        // While descending, also retain the deepest parent with a non-removed sibling.
        if (cur.length) while (true) {
            if (right = x >= (xm = (x0 + x1) / 2)?1:0) x0 = xm; else x1 = xm;
            if (bottom = y >= (ym = (y0 + y1) / 2)?1:0) y0 = ym; else y1 = ym;
            if (!(parent = cur, cur = cur[i = bottom << 1 | right])) return this;
            if (!cur.length) break;
            if (parent[(i + 1) & 3] || parent[(i + 2) & 3] || parent[(i + 3) & 3]) retainer = parent, j = i;
        }

        // Find the point to remove.
        while (cur.data !== node) if (!(previous = cur, cur = cur.next)) return this;
        if (next = cur.next) delete cur.next;

        // If there are multiple coincident points, remove just the point.
        if (previous) return (next ? previous.next = next : delete previous.next), this;

        // If this is the root point, remove it.
        if (!parent) return this.root = next, this;

        // Remove this leaf.
        next ? parent[i!] = next : delete parent[i!];

        // If the parent now contains exactly one leaf, collapse superfluous parents.
        if ((cur = parent[0] || parent[1] || parent[2] || parent[3])
            && cur === (parent[3] || parent[2] || parent[1] || parent[0])
            && !cur.length) {
            if (retainer) retainer[j!] = node;
            else this.root = cur;
        }

        return this;
    }
    //从根节点倒着遍历 自底向上
    visitAfter(callback: (quadnode:any,x0:number,y0:number,x1:number,y1:number)=>boolean){
        let quads = [] as {
            node: any
            x0: number
            y0: number
            x1: number
            y1: number
        }[], next = [], q,child;
        let { x0, y0, x1, y1 } = this
        if (this.root) quads.push({ node: this.root, x0, y0, x1, y1 });
        while (q = quads.pop()) {
          var node = q.node;
          if (node.length) {
            x0 = q.x0, y0 = q.y0, x1 = q.x1, y1 = q.y1
            let xm = (x0 + x1) / 2, ym = (y0 + y1) / 2;
            if (child = node[0]) quads.push({ node: child, x0, y0, x1: xm, y1: ym });
            if (child = node[1]) quads.push({ node: child, x0: xm, y0, x1, y1: ym });
            if (child = node[2]) quads.push({ node: child, x0, y0: ym, x1: xm, y1 });
            if (child = node[3]) quads.push({ node: child, x0: xm, y0: ym, x1, y1 });
          }
          next.push(q);
        }
        while (q = next.pop()) {
          callback(q.node, q.x0, q.y0, q.x1, q.y1);
        }
        return this;
    }
}