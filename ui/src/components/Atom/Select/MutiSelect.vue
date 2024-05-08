<template>
    <div class="MultiSelect">
        <slot v-for="(item,index) in props.data" :key="index" :item="item" :index="index" @click="changeSelected(index)"></slot>
    </div>
</template>
<script lang="ts" setup>

const [selecteds, selectedsModifiers] = defineModel<number[]>('selecteds',{required:true})
const props=defineProps<{
    data:any[]
}>()
function changeSelected(index:number){
    if(selecteds.value.includes(index)){
        selecteds.value=selecteds.value.filter(item=>item!==index)
    }else{
        selecteds.value.push(index)
    }
}
</script>
<style scoped lang="scss">
</style>