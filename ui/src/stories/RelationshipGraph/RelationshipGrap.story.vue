<script setup lang="ts">

import { useStoryConfig } from '../store';

import { storeToRefs } from 'pinia';
import ForceLayout from './ForceLayout.vue';
import FixedLayout from './FixedLayout.vue';
import WithD3LayoutD3Event from './WithD3LayoutD3Event.vue';
import WithD3LayoutEchartsEvent from './WithD3LayoutEchartsEvent.vue';
import Distance from './Distance.vue';
import LegendSelect from './LegendSelect.vue';
import EdgeValue from './EdgeValue.vue';
import BloomLayout from './BloomLayout.vue';
import SpanningTreeLayout from './SpanningTreeLayout.vue';
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
        <Variant title="With D3 Layout D3 Event">
            <div class="Wrapper">
                <WithD3LayoutD3Event></WithD3LayoutD3Event>
            </div>
        </Variant>
        <Variant title="With D3 Layout Echarts Event">
            <div class="Wrapper">
                <WithD3LayoutEchartsEvent></WithD3LayoutEchartsEvent>
            </div>
        </Variant>
        <Variant title="Repulsive And Gravity">
            <div class="Wrapper">
                <Distance></Distance>
            </div>
        </Variant>
        <Variant title="Legend Select">
            <div class="Wrapper">
                <LegendSelect></LegendSelect>
            </div>
        </Variant>
        <Variant title="Edge Value">
            <div class="Wrapper">
                <EdgeValue></EdgeValue>
            </div>
        </Variant>
        <Variant title="Bloom Layout">
            <div class="Wrapper">
                <BloomLayout></BloomLayout>
            </div>
        </Variant>
        <Variant title="Spanning Tree">
            <div class="Wrapper">
                <SpanningTreeLayout></SpanningTreeLayout>
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
