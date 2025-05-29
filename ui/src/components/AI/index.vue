<template>
    <div class="AIChat">
        <a-layout style="min-height: 100vh">
            <SideBar />
            <a-layout>
                <a-layout-header style="background: #fff; padding: 0" />
                <a-layout-content style="margin: 0 0px">
                    <ChatArea />
                </a-layout-content>
                <div class="InputBox">
                    <a-textarea v-model:value="inputValue" placeholder="问我任何消息" :rows="4">
                    </a-textarea>
                    <div class="ButtonGroup">
                        <SendIcon @click="sendMsg" />
                    </div>
                </div>
            </a-layout>
        </a-layout>
    </div>
</template>
<script lang="ts" setup>
import SideBar from './SideBar.vue';
import ChatArea from './ChatArea.vue';
import { provide, ref } from 'vue';
import { sendMessageApi } from './aichat_api'
import SendIcon from './SendIcon.vue';
import { message } from 'ant-design-vue';
const [messageApi, contextHolder] = message.useMessage();

const inputValue = ref('');
const loading = ref(false);
const messages = ref([] as any[]);
const currentChatId = ref(null)
provide('messages', messages)
provide('currentChatId', currentChatId);
async function sendMsg() {
    if (inputValue.value.trim() === '') {
        return;
    }
    loading.value = true; // 设置加载状态
    messages.value = [...messages.value, { role: 'user', content: inputValue.value,type:'text' }];
    // 这里可以添加发送消息的逻辑
    const res = await sendMessageApi({ messages:messages.value,chatId:currentChatId.value,modelName:'qwen72' });
    if (res.status !== 200) {
        messageApi.error('发送消息失败:');
        loading.value = false; // 重置加载状态
        return;
    }
    messages.value = [...messages.value, { role: 'user', content: inputValue.value }];

    console.log('发送结果:', res);
    console.log('发送消息:', inputValue.value);
    inputValue.value = ''; // 清空输入框

}
</script>
<style lang="scss" scoped>
::v-deep(.ant-layout) {
    background-color: #fff;
    position: relative;
}

::v-deep(.ant-layout-footer) {
    background-color: transparent;
    padding: 20px 200px;
}

.InputBox {

    min-height: 80px;
    max-height: 200px;
    position: absolute;
    top: v-bind("currentChatId ? '80%' : '50%'");
    width: 800px;
    height: fit-content;
    left: 50%;
    transform: translateX(-50%);
    border: 0;
    border-radius: 25px;
    background-color: #f7f7f7;
    padding: 10px 20px;
    padding-right: 50px;
    vertical-align: top;
    color: #374151;

    ::v-deep(.ant-input) {
        height: 100%;
        border: none;
        background-color: transparent;
        box-shadow: none;
        color: rgb(55, 65, 81, .5) !important;
        font-size: 16px;
        overflow-y: auto;

        &::placeholder {
            font-size: 16px;
            color: rgb(55, 65, 81, .5) !important;
        }
    }

    .ButtonGroup {
        position: absolute;
        right: 25px;
        top: 50%;
        transform: translateY(-50%);

    }

}
</style>