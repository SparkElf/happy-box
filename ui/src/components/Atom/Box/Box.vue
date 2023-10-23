<script setup lang="ts">

</script>

<template>
    <div class="Box">
        <slot name="Left">
            <div class=""></div>
        </slot>
        <slot name="Right"></slot>
        <div class="CenterWrapper">
            <slot name="Top"></slot>
            <slot>
            </slot>
            <slot name="Bottom">
            </slot>
        </div>
    </div>
</template>
