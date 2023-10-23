<script setup lang="ts">

const {type}=defineProps<{
    type:'collapse'|'expande'|'float',
    hide:boolean,
    position:'left'|'right'|'bottom'|'top'
}>()
</script>

<template>
    <div :class="['SideBar',type.toUpperCase(),{hide},position.toUpperCase()]" >
        <slot></slot>
    </div>
</template>
<style scoped lang=scss>
</style>
