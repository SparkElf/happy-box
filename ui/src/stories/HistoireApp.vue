<script setup lang="tsx">
import type { Story, Variant } from 'histoire';
import { onMounted, ref } from 'vue';
import Input from '@/components/Atom/Input/Input.vue';
import { provide } from 'vue';
import { useStoryConfig } from './store';
import { storeToRefs } from 'pinia';

const {story,variant} = defineProps<{
    story?: Story
    variant?: Variant
    theme?: string
}>()
const {theme}=storeToRefs(useStoryConfig())
</script>

<template>
    <div  class="App GlobalWrapper" :class="theme">
        <slot/>
    </div>
</template>
<style scoped lang=scss>
@import "@/themes/GreenDark.scss";
.App{
    min-width: fit-content !important;
    min-height: fit-content !important;
    background-color: transparent !important;
}
</style>
