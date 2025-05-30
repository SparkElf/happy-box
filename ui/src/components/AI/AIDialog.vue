<template>
  <div class="ai-dialog-container">
    <a-modal v-model:open="open" width="80vw" style="height: 80vh" :wrapStyle="{ top: '-50px' }" @ok="open=false">
      <AIChat height="75vh"></AIChat>
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
import AIChat from '@/components/AI/index.vue'
import {ref} from 'vue'
import {RobotOutlined} from "@ant-design/icons-vue";
import { message } from 'ant-design-vue';

const open = ref(false)

// 右下角悬浮按钮
function openDialog() {
  // message.success("openDialog!!!")
  open.value = true
}

</script>

<style scoped lang="scss">

</style>
