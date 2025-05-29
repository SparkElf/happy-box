<template>
    <div class="ChatArea">
        <ChatItem v-for="item in 10" :key="item" :role="item%2===0?'user':'bot'" v-if="currentChatId"/>
        <div class="Welcome" v-else style="display: flex; justify-content: center;align-items: center; position: absolute; left: 50%; top: 40%; transform: translate(-50%, -50%)">
            <img class="Logo" :src="RobotIcon" style="border-radius: 50%; width: 50px; height: 50px"></img>
            <div class="WelcomeText" style="font-size: 32px;margin-left: 24px;">欢迎</div>
        </div>
    </div>
</template>
<script lang="ts" setup>

import ChatItem from './ChatItem.vue';
import { inject, ref, watch } from 'vue';
import RobotIcon from './robot.jpg'
const messages = inject('messages') as any[]; // 使用 inject 获取 messages
const currentChatId = inject('currentChatId') as Number; // 获取当前聊天 ID
const modelName = ref("qwen72")
watch(currentChatId, (newChatId) => {
    if (newChatId) {
        getChatBaseInfo(newChatId); // 获取聊天基本信息
    }
}, { immediate: true }); // 监听 currentChatId 的变化
function getChatBaseInfo(chatId) {
    // 这里可以添加获取聊天基本信息的逻辑
    console.log(`获取聊天 ${chatId} 的基本信息`);
}
watch(messages, (newMessages) => {
    console.log('Messages updated:', newMessages);
}, { immediate: true }); // 监听 messages 的变化


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
