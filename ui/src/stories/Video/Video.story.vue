<script setup lang="ts">

import { useStoryConfig } from '../store';

import { storeToRefs } from 'pinia';
import VideoPlayer from '@/components/Video/VideoPlayer.vue';
import VideoPlayerMiddlewareExample from './Middleware.vue';
const { theme } = storeToRefs(useStoryConfig())


</script>
<template>
    <Story>
        <Variant title="base">
            <div class="Wrapper">
                <VideoPlayer/>
            </div>
        </Variant>
        <Variant title="middleware">
            <div class="Wrapper">
                <VideoPlayerMiddlewareExample/>
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
</style>
<docs lang="md">

</docs>
