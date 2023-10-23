<script setup lang="ts">
import { onMounted, provide, ref, watch } from 'vue';

import { FormSymbol, FormItemSymbol } from './type'

import { inject } from 'vue';
import { type FormRule, Required } from './validator';

//HTMLElement的引用，灵感来自vueform组件库：https://vueform.com/reference/form-elements#properties
const left$ = ref<HTMLElement | null>(null)
const top$ = ref<HTMLElement | null>(null)
const right$ = ref<HTMLElement | null>(null)
const bottom$ = ref<HTMLElement | null>(null)
const error$ = ref<HTMLElement | null>(null)
const center$ = ref<HTMLElement | null>(null)
const { ruleProp = null, label, ...props } = defineProps<{
    rules?: FormRule[]
    ruleProp?: any,
    label?: string,
    required?: boolean | string
    info?: string
    infoPosition?: 'left' | 'right' | 'top' | 'bottom'
    description?: string
}>()

const validState = ref({
    isValid: false,
    errorMsg: [] as string[]
})
const rules = ref(props.rules ? props.rules : [])
const required = ref(props.required)

const hasRequired = rules.value.some(rule => rule instanceof Required)
if (required.value) {
    if (!hasRequired) rules.value.push(new Required(typeof required.value === 'string' ? required.value : ''))
} else {
    if (hasRequired) required.value = true
}


const { labelAlign, errorAlign, valids, resetValids } = inject(FormSymbol)!
async function valid() {
    let isValid = true
    let errorMsg = [] as string[]
    for (let i = 0; i < rules.value.length; i++) {
        const res = await rules.value[i].valid(ruleProp)
        if (res.isValid === false) {
            errorMsg.push(res.errorMsg)
            isValid = false
        }

    }
    validState.value = { isValid, errorMsg }

    return validState.value
}
function resetValid() {
    validState.value = { isValid: true, errorMsg: [] }
}
//注册到Form组件中集中托管
valids.value.push(valid)
resetValids.value.push(resetValid)
//使错误信息对齐
watch(error$, (newv, oldv) => {
    if (error$.value) {
        const box = center$.value?.getBoundingClientRect()
        error$.value.style.marginLeft = box?.left + 'px'
    }
})


provide(FormItemSymbol, { validState: validState.value, label, required: required.value })
defineExpose({ valid })

</script>

<template>
    <div class="FormItem" :class="{ Required: rules.includes }">
        <Teleport :to="labelAlign === 'top' ? top$ : left$" v-if="left$ && top$">
            <div class="FormLabel">
                <slot name="Label">
                    {{ label }}
                </slot>
            </div>
        </Teleport>
        <Teleport :to="errorAlign === 'bottom' ? bottom$ : right$" v-if="right$ && bottom$">
            <div class="FormError" v-if="!validState.isValid" ref="error$">
                <slot name="Error" :validState="validState">
                    <div class="FormErrorMsg" v-for="(error, index) in validState.errorMsg" :key="index">
                        {{ error }}
                    </div>
                </slot>
            </div>
        </Teleport>

        <div class="Top" ref="top$">
            <slot name="Top"></slot>
        </div>
        <div class="CenterWrapper">
            <div class="Left" ref="left$">
                <slot name="Left">
                </slot>
            </div>
            <div class="Center" ref="center$">
                <slot></slot>
            </div>

            <div class="Right" ref="right$">
                <slot name="Right"></slot>
            </div>
        </div>
        <div class="Bottom" ref="bottom$">
            <slot name="Bottom"></slot>
        </div>



    </div>
</template>

