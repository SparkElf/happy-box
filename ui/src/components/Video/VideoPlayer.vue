<script setup lang="ts">
import { onMounted, ref } from 'vue';
import videojs from 'video.js'
import 'video.js/dist/video-js.min.css';
import videojsZhCNJSON from 'video.js/dist/lang/zh-CN.json'
import { shallowRef } from 'vue';
const video$ = ref<HTMLVideoElement>()
const player = shallowRef<ReturnType<typeof videojs>>()
function init() {
    if (video$.value == null) return
    videojs.addLanguage('zh-CN', videojsZhCNJSON)
    player.value = videojs(video$.value, {
        //https://videojs.com/guides/options/#aspectratio
        aspectRatio: "16:9",
        fluid: true,
        language: 'zh-CN',
        playbackRates: [1, 1.5, 2],
        controlBar: {
            skipButtons: {
                forward: 5
            }
        }
    }, () => {
        console.log('videojs init success')
    })
}
onMounted(() => {
    init()
})

</script>
<template>
    <div class="VideoContainer">
        <video class="Video video-js" controls ref="video$">
            <source
                src="https://cdn.bitmovin.com/content/assets/art-of-motion-dash-hls-progressive/mpds/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.mpd" />
        </video>
    </div>
</template>


<style scoped lang="scss" >
@import url('video.js/dist/video-js.min.css');

.VideoContainer {
    width: 600px;
}
</style>