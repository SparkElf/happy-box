<script setup lang="ts">

import { useStoryConfig } from '../store';

import { storeToRefs } from 'pinia';
import ForceLayout from './ForceLayout.vue';
import FixedLayout from './FixedLayout.vue';
import WithD3Layout from './WithD3Layout.vue';
const { theme } = storeToRefs(useStoryConfig())


</script>
<template>
    <Story>
        <Variant title="Fixed Layout">
            <div class="Wrapper">
                <FixedLayout></FixedLayout>
            </div>
        </Variant>
        <Variant title="Force Layout">
            <div class="Wrapper">
                <ForceLayout></ForceLayout>
            </div>
        </Variant>
        <Variant title="With D3 Layout">
            <div class="Wrapper">
                <WithD3Layout></WithD3Layout>
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
