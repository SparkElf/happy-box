<script setup lang="ts">
import MutiSelect from '@/components/Atom/Select/MutiSelect.vue';
import { ref } from 'vue';
const multiSelectData=ref([1,2,3,4])
const multiSelecteds=ref([])
</script>
<template>
   <Story>
        <Variant title="MultiSelect">
            <MutiSelect :data="multiSelectData" v-model:selecteds="multiSelecteds">
                <template v-slot="{item,index}">
                    {{item}}{{ index }}
                </template>
            </MutiSelect>
        </Variant>
    </Story>
</template>
<style scoped lang="scss">

</style>