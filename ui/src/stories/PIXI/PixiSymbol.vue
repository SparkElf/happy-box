<script setup lang="ts">
import { Application } from 'pixi.js';
import { onMounted, ref } from 'vue';

const pixiContainer$ = ref<HTMLDivElement | null>()
onMounted(() => {
    if (!pixiContainer$.value) return
    console.log(pixiContainer$.value)
    const app = new Application<HTMLCanvasElement>({ background: '#1099bb', resizeTo: pixiContainer$.value });
    pixiContainer$.value?.appendChild(app.view as any)
    // const circle = new Graphics()
    //     circle.beginFill(0x000000)
    //     circle.drawCircle(node.x, node.y, node.props.radius)
    //     circle.endFill()
})
</script>
<template>
    <div ref="pixiContainer$" class="PixiContainer">
    </div>
</template>
<style lang="scss">
.PixiContainer {
    width: 500px;
    height: 500px;
    //background-color: red;
    overflow: hidden;
}
</style>