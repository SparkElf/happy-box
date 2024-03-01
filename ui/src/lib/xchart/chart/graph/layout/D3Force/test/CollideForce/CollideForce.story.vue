<template>
    <Story title="Xchart/Graph/Force/CollideForce"    :layout="{ type: 'grid', width: 600 }">
        <!-- <Variant title="D3">
            <D3 :nodes="nodes1" :edges="edges1"/>
        </Variant>
        <Variant title="Xchart">
            <Xchart :nodes="nodes2" :edges="edges2"/>
        </Variant> -->
        <Variant title="Xchart Best Param">
            <BestParam :nodes="nodes3" :edges="edges3"/>
        </Variant>
    </Story>
</template>
<script setup lang="ts">
import { shallowRef } from 'vue';
import D3 from './D3.vue';
import Xchart from './Xchart.vue';
import BestParam from './BestParam.vue';
import {nodes,edges} from './share'

const nodes1 = shallowRef(structuredClone(nodes))
const nodes2= shallowRef(structuredClone(nodes))
const nodes3= shallowRef(structuredClone(nodes))
const edges1=shallowRef(structuredClone(edges))
const edges2=shallowRef(structuredClone(edges))
const edges3=shallowRef(structuredClone(edges))
</script>
<style scoped lang="scss">
</style>