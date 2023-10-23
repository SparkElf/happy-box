
<template>
    <div class="List" :class="[layout, { Reverse: reverse }]">
        <div class="ListItem" :class="{ Selected: isSelected(index),Disabled:isDisabled(index) }" v-if="data" v-for="(item, index) in data" :key="index"
            @click="() => handleSelect(index, multi)">
            <slot name="item" :data="item" :index="index" :handleSelect="(index:number)=>handleSelect(index,multi)"></slot>
        </div>

    </div>
</template>
<script setup lang="ts" generic="DataType,IsMulti extends boolean=false">

type selectIdType = (IsMulti extends true ? number[] : number)|undefined

//disable和select分开维护
const { layout = 'Row', data, reverse, multi, selectId,disableIds,defaultClick=true } = defineProps<{
    layout?: 'Row' | 'Column',
    reverse?: boolean
    multi?: IsMulti
    data?: DataType[],
    selectId?: selectIdType
    disableIds?:number[]
    defaultClick?:boolean
}>()

const emits = defineEmits<{
    (e: 'update:selectId', value: selectIdType): void
 }>()



function handleSelect(index: number, multi: any) {
    if(defaultClick===false)return
    if (multi === true) {
        let arr = selectId as number[]
        let flag=true
        for (let i = 0; i < arr.length; i++)
            if (arr[i] == index) {
                arr.splice(i, 1)
                flag=false
                break
            }
        if (flag) arr.push(index)
        emits('update:selectId', arr as any)

    }
    else emits('update:selectId', index as any)
}
function isSelected(index: number) {
    if (multi === true) return (selectId as number[]).includes(index)
    else return selectId === index
}
function isDisabled(index:number){
    console.log(disableIds,index)
    return disableIds?.includes(index)
}
</script>
<style lang="scss" scoped>
.List {
    display: flex;
    &.Column {
        flex-direction: column;
        &.Reverse {
            flex-direction: column-reverse;
        }
    }
    &.Reverse {
        flex-direction: row-reverse;
    }
}</style>
