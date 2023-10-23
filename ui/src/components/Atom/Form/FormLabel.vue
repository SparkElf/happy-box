<template>
    <div class="FormLabel" :class="{Required:required}">
        {{ label }}
    </div>
</template>
<script setup lang="ts">
const {label,required}=defineProps<{label:string,required:boolean}>()
</script>