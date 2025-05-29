<template>
    <div class="ai-chat-wrapper">
      <ChatInterface />
    </div>
  </template>

  <script setup lang="ts">
  import ChatInterface from './ChatInterface.vue'

  // 可以在这里定义一些全局配置或props
  defineOptions({
    name: 'AIChat'
  })

  // 如果需要接收外部配置，可以定义props
  const props = defineProps({
    // API配置
    apiUrl: {
      type: String,
      default: '/api/chat'
    },
    // 默认模型
    defaultModel: {
      type: String,
      default: 'gpt-4'
    },
    // 主题配置
    theme: {
      type: String,
      default: 'light',
      validator: (value) => ['light', 'dark'].includes(value)
    },
    // 是否显示侧边栏
    showSidebar: {
      type: Boolean,
      default: true
    }
  })

  // 向外暴露一些方法，供父组件调用
  defineExpose({
    // 可以暴露一些控制方法
  })
  </script>

  <style scoped>
  .ai-chat-wrapper {
    width: 100%;
    height: 100%;
    display: flex;
  }
  </style>