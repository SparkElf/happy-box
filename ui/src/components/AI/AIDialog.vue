<template>
  <div class="ai-dialog-container" v-if="showAIDialog">
    <a-modal v-model:open="open" width="80vw" style="height: 80vh" :wrapStyle="{ top: '-50px',zIndex: '1002' }" @ok="open=false">
      <!-- <AIChat ></AIChat> -->
      <component :is="AIChat" v-if="open"></component>
      <template #footer>
        <!-- <a-button key="submit" type="primary" @click="open=false">关闭</a-button> -->
      </template>
    </a-modal>
    <a-float-button
        type="primary"
        :style="{
            right: '34px',
            height: '50px',
            width: '50px'
          }"
        @click="openDialog"
    >
      <template #icon>
        <RobotOutlined />
      </template>
    </a-float-button>
  </div>
</template>

<script setup lang="ts">
import AIChat from './index.vue'
import {ref,computed} from 'vue'
import {RobotOutlined} from "@ant-design/icons-vue";
// import { message } from 'ant-design-vue';




const open = ref(false)

import {useRoute} from 'vue-router'
const route = useRoute()
const showAIDialog = computed(() => {
  console.log(route.fullPath.includes("/yjks/index"))
  return route.fullPath.includes("/yjks/index")
})
// 右下角悬浮按钮
function openDialog() {

  open.value = true
}

</script>

<style scoped lang="scss">

</style>
