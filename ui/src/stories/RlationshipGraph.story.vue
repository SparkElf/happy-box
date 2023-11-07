<script setup lang="ts">

import { useStoryConfig } from './store';

import { storeToRefs } from 'pinia';
import Renderer from '@/components/RelationshipGraph/Renderer.vue';
const { theme } = storeToRefs(useStoryConfig())


</script>
<template>
    <Story>
        <Variant title="directive">
            <div class="Wrapper">
                <Renderer></Renderer>
            </div>
        </Variant>
        <template #controls>
            <HstText v-model="theme" title="theme" />
        </template>
    </Story>
</template>
<docs lang="md">

</docs>
<style lang="scss" scoped>
.Wrapper {
    position: fixed;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
}


</style>
<docs lang="md">

</docs>
