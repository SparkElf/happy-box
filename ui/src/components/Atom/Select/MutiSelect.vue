<template>
    <div class="MultiSelect">
        <slot v-for="(item,index) in props.data" :key="index" :item="item" :index="index" :changeSelected="changeSelected"></slot>
    </div>
</template>
<script lang="ts" setup generic="T">

const emits=defineEmits<{
    (e:'update:selected',selecteds:number[]):void
}>()
const props=defineProps<{
    data:T[]
    selecteds:number[]
}>()
function changeSelected(index:number){
    if(props.selecteds.includes(index)){
        emits('update:selected',props.selecteds.filter(item=>item!==index))
       
    }else{
        props.selecteds.push(index)
        emits('update:selected',[...props.selecteds])
    }

}
</script>
<style scoped lang="scss">
</style>