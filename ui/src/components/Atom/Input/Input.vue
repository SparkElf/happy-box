<script setup lang="ts">
import { ref, type Ref } from 'vue';
import {Close,Loading} from '@/components/icons/index'
import { onMounted } from 'vue';

const addonLeft$=ref<HTMLElement|null>(null);
const addonRight$=ref<HTMLElement|null>(null);
const {clearable=false,loading=false,clearAlign='right',loadingAlign='right',value='',disabled}=defineProps<{
    clearable?:boolean;
    clearAlign?:'left'|'right';
    loadingAlign?:'left'|'right';
    loading?:boolean;
    maxLength?:number
    showMaxLength?:boolean
    minLength?:number
    placeholder?:string
    value:string
    disabled?:boolean
}>()
const emits=defineEmits<{
    'update:value':[value:string]
}>()
function updateValue(payload:Event){
    const target=payload.target as HTMLInputElement;
    emits('update:value',target.value)
}

</script>

<template>
    <div class="Input" :class="{Disabled:disabled}">
        <Teleport :to=" clearAlign=== 'right' ? addonRight$ : addonLeft$" v-if="clearable&&addonLeft$&&addonRight$">
            <div class="ClearBtn">
                <slot name="ClearBtn">
                    <Close></Close>
                </slot>
            </div>
        </Teleport>
        <Teleport :to=" loadingAlign=== 'right' ? addonRight$ : addonLeft$" v-if="loading&&addonLeft$&&addonRight$">
            <div class="LoadingBtn">
                <slot name="LoadingBtn">
                    <Loading></Loading>
                </slot>
            </div>
        </Teleport>
        <div class="Addon Left" ref="addonLeft$">
            <slot name="AddonLeft"></slot>
        </div>
        <input @input="updateValue" :value="value" :placeholder="placeholder"/>
        <div class="Addon Right">
            <slot name="AddonRight"></slot>
        </div>
    </div>
</template>
