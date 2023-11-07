<script setup lang="ts">
import { ref } from 'vue';
import { useStoryConfig } from './store';
import { storeToRefs } from 'pinia';
import { vAnchor } from '@/directives/AnchorPosition'
import { vDraggable } from '@/directives/Draggable';
const { theme } = storeToRefs(useStoryConfig())

const target1$ = ref<HTMLElement>()
const target2$ = ref<HTMLElement>()
const target3$ = ref<HTMLElement>()
const target4$ = ref<HTMLElement>()
const target5$ = ref<HTMLElement>()
const target6$ = ref<HTMLElement>()
const target7$ = ref<HTMLElement>()
const target8$ = ref<HTMLElement>()
const target9$ = ref<HTMLElement>()
//const target10$ = ref<HTMLElement>()
</script>
<template>
    <Story>
        <Variant title="TopToBottom">
            <div class="Wrapper">
                <div class="El" v-anchor="{
                    target: target1$, links: [{
                        elEdge: 'top',
                        targetEdge: 'bottom',
                        distance: 50,

                    }]
                }">El</div>
                <div class="Target" ref="target1$">Target</div>
            </div>
        </Variant>
        <Variant title="TopToTop">
            <div class="Wrapper">
                <div class="El" v-anchor="{
                    target: target2$, links: [{
                        elEdge: 'top',
                        targetEdge: 'top',
                        distance: 50,

                    }]
                }">El</div>
                <div class="Target" ref="target2$">Target</div>
            </div>
        </Variant>
        <Variant title="BottomToTop">
            <div class="Wrapper">
                <div class="El" v-anchor="{
                    target: target3$, links: [{
                        elEdge: 'bottom',
                        targetEdge: 'top',
                        distance: 50,

                    }]
                }">El</div>
                <div class="Target" ref="target3$">Target</div>
            </div>
        </Variant>
        <Variant title="BottomToBottom">
            <div class="Wrapper">
                <div class="El" v-anchor="{
                    target: target4$, links: [{
                        elEdge: 'bottom',
                        targetEdge: 'bottom',
                        distance: 50,

                    }]
                }">El</div>
                <div class="Target" ref="target4$">Target</div>
            </div>
        </Variant>
        <Variant title="LeftToRight">
            <div class="Wrapper">

                <div class="El" v-anchor="{
                    target: target5$, links: [{
                        elEdge: 'left',
                        targetEdge: 'right',
                        distance: 50,

                    }]
                }">El</div>
                <div class="Target" ref="target5$">Target</div>
            </div>
        </Variant>
        <Variant title="LeftToLeft">
            <div class="Wrapper">

                <div class="El" v-anchor="{
                    target: target6$, links: [{
                        elEdge: 'left',
                        targetEdge: 'left',
                        distance: 50,

                    }]
                }">El</div>
                <div class="Target" ref="target6$">Target</div>
            </div>
        </Variant>
        <Variant title="RightToLeft">
            <div class="Wrapper">

                <div class="El" v-anchor="{
                    target: target7$, links: [{
                        elEdge: 'right',
                        targetEdge: 'left',
                        distance: 50,

                    }]
                }">El</div>
                <div class="Target" ref="target7$">Target</div>
            </div>

        </Variant>
        <Variant title="RightToRight">
            <div class="Wrapper">
                <div class="El" v-anchor="{
                    target: target8$, links: [{
                        elEdge: 'right',
                        targetEdge: 'right',
                        distance: 50,

                    }]
                }">El</div>
                <div class="Target" ref="target8$">Target</div>
            </div>

        </Variant>
        <Variant title="Nested">
            <div class="Wrapper">


                <div class="El" ref="target9$" v-anchor="{
                    target: target8$, links: [{
                        elEdge: 'top',
                        targetEdge: 'bottom',
                        distance: 50,

                    }]
                }">El1</div>
                <div class="El"  v-anchor="{
                    target: target9$, links: [{
                        elEdge: 'top',
                        targetEdge: 'bottom',
                        distance: 50,

                    }]
                }">El2</div>
                <div class="Target" ref="target8$">Target</div>
            </div>

        </Variant>
        <Variant title="Nested With Drag">
            <div class="Wrapper">
                <div class="El" ref="target9$" v-anchor="{
                    target: target8$, links: [{
                        elEdge: 'top',
                        targetEdge: 'bottom',
                        distance: 50
                    }]
                }">El1</div>
                <div class="El"  v-anchor="{
                    target: target9$, links: [{
                        elEdge: 'top',
                        targetEdge: 'bottom',
                        distance: 50,
                    }]
                }">El2</div>
                <div class="Target" ref="target8$" v-draggable >Target</div>
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
    position: relative;
    width: 100px;
    height: 100px;
    background: #f00;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2;
}

.Target {

    width: 100px;
    height: 100px;
    background: #00f;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    transform: translate(10px,-200px);
}
</style>
