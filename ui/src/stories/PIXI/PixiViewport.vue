<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { Viewport } from 'pixi-viewport'
import { Application, Sprite } from 'pixi.js';
const pixiContainer$ = ref<HTMLDivElement | null>()
onMounted(() => {
    if (!pixiContainer$.value) return
    console.log(pixiContainer$.value)
    const app = new Application<HTMLCanvasElement>({ background: '#1099bb', resizeTo: pixiContainer$.value });
    const viewport = new Viewport({
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight,
        worldWidth: 1000,
        worldHeight: 1000,

        events: app.renderer.events // the interaction module is important for wheel to work properly when renderer.view is placed or scaled
    })
    app.stage.addChild(viewport)
    viewport
    .drag()
    .pinch()
    .wheel()
    .decelerate()
    pixiContainer$.value?.appendChild(app.view as any)

    const bunny=viewport.addChild(Sprite.from('https://pixijs.com/assets/bunny.png'))
    // Opt-in to interactivity
    bunny.eventMode = 'static';//正常交互 dynamic表示还接受mock事件
    bunny.cursor  = 'pointer'; // cursor change

    // center the sprite's anchor point
    bunny.anchor.set(0.5)

    // move the sprite to the center of the screen
    bunny.x = app.screen.width / 2
    bunny.y = app.screen.height / 2
    app.ticker.add((delta) => {
        // just for fun, let's rotate mr rabbit a little
        // delta is 1 if running at 100% performance
        // creates frame-independent transformation
        bunny.rotation += 0.1 * delta;
    });


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