<script setup lang="ts">
import { Form, FormItem, Required } from '@/components/Atom/Form/index';
import { Input } from '@/components/Atom/Input/index';
import { Button } from '@/components/Atom/Button/index';
import { ref } from 'vue';
import { useStoryConfig } from './store';
import { storeToRefs } from 'pinia';
import { vDraggable } from '@/directives/Draggable';
const { theme } = storeToRefs(useStoryConfig())

const target$ = ref<HTMLElement>()

</script>
<template>
    <Story>
        <Variant title="directive">
            <div class="Wrapper">
                <div class="El" ref="target$" v-draggable></div>
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

.El {
    width: 100px;
    height: 100px;
    background: #f00;
    display: flex;
    align-items: center;
    justify-content: center;
    transform: translate(1px,calc(50% + 2px + 1vw)) rotate(45deg) scale(2) skew(30deg);
}

</style>
<docs lang="md">

1. 黏手性

   当鼠标移动过快时，鼠标常常会脱离拖动元素，导致拖动元素无法跟随鼠标移动。这可能是由于硬件性能或者没有处理防抖所导致的。`v-draggable`使用`setPointerCapture`来将指针事件
   在`pointerdown`后始终绑定到目标元素上，使得鼠标移出元素时仍能使得跟踪生效。

   这样的设计也有着明显的缺点：指针元素唯一地绑定到目标元素，可能导致其他元素的hover事件失效。

2. 适用性

   使用`transform`而不是`position`来实现元素的位移，因为`transform`的性能更高；且当祖先元素使用了`transform`时会创建新的BFC，导致fixed元素的相对元素不再是视口而是该祖先元素；
   当元素使用`absolute`时，父元素可能坍缩，造成offsetLeft的定位点改变。

   基于`Typed CSSOM (chrome >= 66)`堆加`transform`的值，而不是简单的覆盖，使得该拖拽API可以适用使用了`transform`的元素。

   `e.preventDefault`可以阻止存在文字、链接的场景在拖拽时导致文字选择、打开链接、拖拽文字等默认行为。
3. 性能

   使用`RequestAnimationFrame`来保证动画的流畅性。

   拖动元素内部的子元素过多会导致拖动显著变慢。
</docs>
