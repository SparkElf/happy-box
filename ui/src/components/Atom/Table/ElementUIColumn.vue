<template>
    <!-- 表格的列自适应宽度 -->
    <el-table-column align="center" :width="width">
        <template #header>
            <span>{{ label }}</span>
            <el-tooltip class="item" effect="dark" :content="toolTip" placement="right" v-if="toolTip">
                <i class="el-icon-info"></i>
            </el-tooltip>
        </template>
        <template #default="scope">
            {{ content(scope.row) }}
        </template>
    </el-table-column>
</template>
<script setup lang="ts">
import { computed } from '@vue/reactivity';
import { ref } from 'vue';

const props = defineProps<{
    prop: string,
    label: string,
    toolTip: string
}>()
const maxContentLength = ref(0)
const width = computed(() => (props.toolTip ? 20 : 0) + (props.label.length > maxContentLength.value ? props.label.length : maxContentLength.value) * 24)
function content(row: Record<string, string | null>) {
    if (props.prop == null) return ""
    let s = row[props.prop]
    if (s == null) return ''
    else if (s.length > maxContentLength.value) maxContentLength.value = s.length
    return s
}
</script>
<style lang="scss">
</style>