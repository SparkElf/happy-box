// src/mocks/handlers.js
import type { LevelGraphResponse } from '@/api/xchart/graph'
import { http, HttpResponse } from 'msw'


import type { GraphEdge, GraphNode } from '@/lib/xchart/chart/graph/Base';
import * as d3 from 'd3'
import { createRandomInt } from '@/utils/mock';
import carImg from '@/assets/icon/car.png'
import currentShopImg from '@/assets/icon/current_shop.png'
import employerImg from '@/assets/icon/employer.png'
import personImg from '@/assets/icon/person.png'
import phoneImg from '@/assets/icon/phone.png'
import shopImg from '@/assets/icon/shop.png'
import flightImg from '@/assets/icon/flight.png'
import hotelImg from '@/assets/icon/hotel.png'
import schoolImg from '@/assets/icon/school.png'
import trainImg from '@/assets/icon/train.png'
const width=600
const height=600
const category=[{
  img:carImg,
  name:'车辆',
  symbol:'circle'
},{
  img:flightImg,
  name:'航班',
  symbol:'circle'
},{
  img:trainImg,
  name:'火车',
  symbol:'circle'
},{
  img:schoolImg,
  name:'学校',
  symbol:'circle'
},{
  img:hotelImg,
  name:'酒店',
  symbol:'circle'
},{
  img:shopImg,
  name:'商店',
  symbol:'circle'
},{
  img:currentShopImg,
  name:'当前商店',
  symbol:'circle'
},{
  img:employerImg,
  name:'店主',
  symbol:'circle'
},
{
  img:personImg,
  name:'人员',
  symbol:'circle'
},{
  img:phoneImg,
  name:'手机',
  symbol:'circle'
}]
function generateNodes(nodesNum = 50) {
    const nodes: GraphNode[] = []
    for (let i = 0; i < nodesNum; i++) {
        const node = {} as any
        node.x = Math.random() * width;
        node.y = Math.random() * height;
        node.index = i;
        node.id = i.toString();
        node.category = createRandomInt(0,category.length-1)
        //node.xTexture={props:{radius:10}}
        nodes.push(node);
    }
    return nodes
}
function generateEdges(nodes: GraphNode[]) {
    const edges = d3.range(nodes.length - 1).map(i => ({
        source: Math.floor(Math.sqrt(i)).toString(),
        target: (i + 1).toString(),
        value: Math.random() + 0.5
    }));
    return edges;
}
const nodes = generateNodes(500)
const edges=generateEdges(nodes) as unknown as  GraphEdge[]



export const handlers = [
  // Intercept "GET https://example.com/user" requests...
  http.get(import.meta.env.VITE_GRAPH_SERVER_BASE_URL+"/getLevelGraphByIdcard", (info) => {
    if (Number(info.params.level) >=3) {
      return HttpResponse.json({code:200,data:{outOfBound:true} as LevelGraphResponse})
    }
    // ...and respond to them using this JSON response.
    return HttpResponse.json({
      code:200,
      data:{
        outOfBound:false,
        graph:{
          nodes,edges,category:category
        }
      }as LevelGraphResponse
    })
  }),
]