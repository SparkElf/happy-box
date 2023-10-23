<script setup lang="ts">
import { ref } from 'vue';
import { useStoryConfig } from './store';
import { storeToRefs } from 'pinia';
import { vDraggable } from '@/directives/Draggable';
import { onMounted } from 'vue';
const { theme } = storeToRefs(useStoryConfig())

const target$ = ref<HTMLElement>()
onMounted(() => {

    setTimeout(() => {
        if (target$.value) {
            const box = target$.value!.getBoundingClientRect()
            const rootBox=document.documentElement.getBoundingClientRect()
            const rootHeight=rootBox.height||window.innerHeight
            const rootWidth=rootBox.width||window.innerWidth

            const intersectionObserver = new IntersectionObserver((entries) => {
                console.log(entries)
                const entry=entries[0]

                let ruler = document.createElement('div')
                ruler.className = 'ruler'
                Object.assign(ruler.style, {
                    position: 'fixed',
                    top: entry.intersectionRect.top + 'px',
                    left: entry.intersectionRect.left + 'px',
                    pointerEvents: 'none',
                    width: entry.intersectionRect.width + 'px',
                    height: entry.intersectionRect.height + 'px',
                    border: '1px solid yellow',
                });
                document.body.appendChild(ruler)
                ruler = document.createElement('div')
                ruler.className = 'ruler'
                Object.assign(ruler.style, {
                    position: 'fixed',
                    top: entry.rootBounds!.top + 'px',
                    left: entry.rootBounds!.left + 'px',
                    pointerEvents: 'none',
                    width: entry.rootBounds!.width+ 'px',
                    height: entry.rootBounds!.height + 'px',
                    border:'1px solid red',
                });
                document.body.appendChild(ruler)
            }, {
                root:document,
                rootMargin: `-${box.top}px -${rootWidth-box.right}px -${rootHeight-box.bottom}px -${box.left}px`,
                threshold:[0.99,0.98,0.97,0.96,0.95,0.94,0.93,0.92,0.91,0,0.01,0.02,0.03,0.04,0.05,0.06,0.07,0.08,0.09,0.1]
            });
            intersectionObserver.observe(target$.value!);
        }

    }, 0);

})
</script>
<template>
    <Story>
        <Variant title="IntersectionObserver">
            <div class="Wrapper">
                <div class="Target" ref="target$" v-draggable>Target</div>
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


.Target {
    width: 100px;
    height: 100px;
    background: #00f;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    transform: translate(1px, 2px);
}
</style>
