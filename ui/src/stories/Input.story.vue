<script setup lang="ts">
import {Input} from '@/components/Atom/Input/index'
import { inject } from 'vue';
import { ref } from 'vue';
import { useStoryConfig } from './store';
import { storeToRefs } from 'pinia';
const valueBasic = ref('')
const valueDisabled = ref('')

const disabled=ref(true)
const {theme}=storeToRefs(useStoryConfig())

</script>
<template>
    <Story   >
        <Variant title="Basic">
            <Input v-model:value="valueBasic" />
        </Variant>
        <Variant title="Disabled">
            <Input v-model:value="valueDisabled" :disabled="disabled"/>
        </Variant>
        <template #controls>
            <HstText v-model="theme" title="theme" />
        </template>
    </Story>
</template>
<style scoped lang="scss">
@import "@/themes/GreenDark.scss";
</style>
