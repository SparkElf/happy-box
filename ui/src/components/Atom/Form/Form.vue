<script setup lang="ts">
import { provide, ref } from 'vue';
import { FormSymbol } from './type';
const {labelAlign='left',errorAlign='bottom'}=defineProps<{
    labelAlign?:'left'|'right'|'top'
    errorAlign?:'right'|'bottom'
}>()
const valids=ref<(()=>Promise<{isValid:boolean ;errorMsg: string[]}>)[]>([] as any)
const resetValids=ref<(()=>void)[]>([] as any)
provide(FormSymbol,{labelAlign,errorAlign,valids,resetValids})
async function valid(){
    return Promise.all(valids.value.map(v=>v()))
}
function resetValid(){
    resetValids.value.forEach(v=>v())
}
defineExpose({
    valid,
    resetValid
})
</script>

<template>
    <div class="Form">
        <slot>

        </slot>
    </div>
</template>
