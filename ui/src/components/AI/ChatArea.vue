<template>
    <div class="ChatArea">
        <ChatItem v-for="item in 10" :key="item" :role="item%2===0?'user':'bot'"/>
    </div>
</template>
<script lang="ts" setup>

import ChatItem from './ChatItem.vue';
import { inject, watch } from 'vue';

const messages = inject('messages') as any[]; // 使用 inject 获取 messages
watch(messages, (newMessages) => {
    console.log('Messages updated:', newMessages);
}, { immediate: true }); // 监听 messages 的变化

function getChatBaseInfo(chatId) {

}
</script>
<style lang="scss" scoped>
.ChatArea{
    padding-top: 20px;
    padding-bottom: 100px;
    $row-padding: 250px;
    padding-right: $row-padding;
    padding-left: $row-padding;
    max-height: 80vh;
    overflow-y: scroll;
}
</style>