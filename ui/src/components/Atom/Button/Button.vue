<script setup lang="ts">
const {disabled}=defineProps<{
    disabled?:boolean
    noStyle?:boolean
}>();
</script>

<template>
    <div class="Button" :class="{Disabled:disabled}">
        <slot></slot>
    </div>
</template>