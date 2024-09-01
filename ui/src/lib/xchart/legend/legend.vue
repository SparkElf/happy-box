<template>

        <MultiSelect :selecteds="selecteds" :data="props.legends" class="Legend" @update:selected="val=>selecteds=val">
            <template v-slot="{item,index,changeSelected}">
                <div class="LegendItem" @click="changeSelected(index)">
                    <div :class="['Symbol',props.symbol]">
                        <img :src="item.img" v-if="item.img"/>
                    </div>
                    <div class="LegendName">{{ item.name }}</div>
                </div>
            </template>
        </MultiSelect>

</template>
<script setup lang="ts">
import MultiSelect from '@/components/Atom/Select/MutiSelect.vue'
import type { LegendProp } from './type';
import { ref, watch } from 'vue';

const props = withDefaults(defineProps<{
    legends:LegendProp,
    selecteds:number[]
    symbol?:'none'|'circle'|'rect'|'square'
    symbolWidth?:number
    symbolHeight?:number
}>(),{
    symbol:'circle',
    symbolWidth:30,
    symbolHeight:30
})
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

    position:absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 30px;
    margin-top: 10px;
}
.LegendItem{
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    .Symbol{
        width: v-bind("props.symbolWidth + 'px' ");
        height: v-bind("props.symbolHeight + 'px'");
        img{
            width: 100%;
            height: 100%;
        }
    }
}
.LegendName{
    font-size: 12px;
    margin-top: 5px;
    color: rgba(3, 31, 106, 1);
}
</style>