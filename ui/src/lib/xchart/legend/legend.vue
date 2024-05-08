<template>

        <MultiSelect :selecteds="selecteds" :data="props.legends" class="Legend" @update:selected="val=>selecteds=val">
            <template v-slot="{item,index,changeSelected}">
                <div class="LegendItem" @click="changeSelected(index)">
                    <div :class="['Symbol',item.symbol]">
                        <img :src="item.img" v-if="item.img"/>
                    </div>
                    <div class="LegendName">{{ item.name }}</div>
                </div>
            </template>
        </MultiSelect>

</template>
<script setup lang="ts">
import MultiSelect from '@/components/Atom/Select/MutiSelect.vue'
import type { LegendData } from './type';
import { ref, watch } from 'vue';

const props = defineProps<{
    legends:LegendData,
    selecteds:number[]
}>()
const selecteds = ref(props.selecteds)
const emits=defineEmits<{
    (e:'update:selected',selecteds:number[]):void
}>()

watch(selecteds,(newVal)=>{
    emits('update:selected',newVal)
    console.log(newVal)
})

</script>

<style lang="scss" scope>

.Legend{
    width: 100px;
    height: 50px;
    background-color: red;
    position:absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    justify-content:space-around;

}
.LegendItem{
    cursor: pointer;
}
</style>