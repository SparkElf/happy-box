import type {  RelationshipGraphData } from "@/components/RelationshipGraph/type";
import type { EChartsOption, EChartsType } from "echarts";

import { watch, type Ref, type ShallowRef } from "vue";

export const useCollapse=(graphData:Ref<RelationshipGraphData>)=>{

}

export const useDragFixed=(graphData:Ref<RelationshipGraphData>,chart:ShallowRef<EChartsType|undefined>)=>{
    watch(chart,(oldv,newv)=>{
        if(chart.value==null)return
        chart.value.on('mouseup',(params)=>{
            console.log(params,graphData.value)
            if(params.dataType==='node'&&graphData.value&&chart.value){
                graphData.value.nodes[params.dataIndex].fixed=true
                graphData.value.nodes[params.dataIndex].x=params.event?.offsetX
                graphData.value.nodes[params.dataIndex].y=params.event?.offsetY
                let option: EChartsOption={
                    series:{
                        nodes:graphData.value.nodes
                    }
                }
                chart.value?.setOption(option)
            }
        })
    })
}

export const useRightClickMenu=(graphData:Ref<RelationshipGraphData>,chart:ShallowRef<EChartsType|undefined>)=>{
    watch(chart,(oldv,newv)=>{
        if(chart.value==null)return
        chart.value.on('contextmenu',(e)=>{
            console.log(e,'contextmenu')
        })
        chart.value.getZr().on('contextmenu',(e,)=>{
            console.log(e,e.target,e.type)
        })
    })
}