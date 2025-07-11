<template>
    <div class="ChatArea" ref="chatArea$">
        <ChatItem v-for="(item, index) in messages" :role="item.role" v-if="currentChatId" :content="item.content"
            :model-name="item.modelName"
            :query-id="item.id"
            :last="item?.last"
            :sqlQueryResult="getSqlQueryResult(item?.sqlResult)"
             />
        <div class="Welcome" v-else
            style="display: flex; justify-content: center;align-items: center; position: absolute; left: 50%; top: 40%; transform: translate(-50%, -50%)">
            <img class="Logo" :src="RobotIcon" style="border-radius: 50%; width: 50px; height: 50px"></img>
            <div class="WelcomeText" style="font-size: 32px;margin-left: 24px;font-weight: 600;">欢迎</div>
        </div>
        <div style="margin: 80px 0;"></div>
    </div>
</template>
<script lang="ts" setup>

import ChatItem from './ChatItem.vue';
import { inject, ref, watch, type Ref } from 'vue';
import RobotIcon from './robot.jpg'
import { chatApi, getAiChatBaseInfoApi } from './aichat_api'
const messages = inject('messages') as Ref<any[]>; // 使用 inject 获取 messages
const currentChatId = inject('currentChatId') as Ref<Number>; // 获取当前聊天 ID
const modelName = ref("qwen72")

watch(currentChatId, (newChatId) => {
    if (newChatId) {
        getChatBaseInfo(newChatId); // 获取聊天基本信息
    }
}, { immediate: true }); // 监听 currentChatId 的变化
async function getChatBaseInfo(chatId, maxRetries = 3) {
    return new Promise((resolve, reject) => {
        let retryCount = 0;

        const fetchData = async () => {
            try {
                const res = await getAiChatBaseInfoApi({ chatId });

                if (res.status !== 200) {
                    throw new Error('获取聊天基本信息失败');
                }

                console.log('获取聊天基本信息成功:', res.data);
                modelName.value = res.data.modelName;
                messages.value = res.data.messages;

                if (messages.value && messages.value.length >= 2) {
                    console.log(`消息长度满足要求: ${messages.value.length}`);
                    clearInterval(intervalId);
                    resolve();
                } else {
                    console.log(`消息长度不足: ${messages.value.length}`);
                    retryCount++;
                    if (retryCount >= maxRetries) {
                        clearInterval(intervalId);
                        reject(new Error('超过最大重试次数，消息长度仍未满足要求'));
                    }
                }
            } catch (error) {
                console.error('请求过程中发生错误:', error);
                retryCount++;
                if (retryCount >= maxRetries) {
                    clearInterval(intervalId);
                    reject(error);
                }
            }
        };

        const intervalId = setInterval(fetchData, 1500);

        // 初始调用一次即可，后续由 setInterval 自动处理
    });
}
import { nextTick } from 'vue';
const chatArea$ = ref<HTMLDivElement | null>(null);
watch(messages, (newMessages) => {
    console.log('Messages updated:', newMessages);
    nextTick(() => {
        if (chatArea$.value) {
            chatArea$.value.scrollTop = chatArea$.value.scrollHeight;
        }
    });
}, { immediate: true }); // 监听 messages 的变化
function getSqlQueryResult(sqlResult) {
    console.log(sqlResult,'(sqlResult)',messages)
    const sqlQueryResult = {}
    if (sqlResult) {

        sqlResult.forEach(item => {
            sqlQueryResult[item.title] = item.result
        })
        return sqlQueryResult
    }
    return sqlQueryResult
}

</script>
<style lang="scss" scoped>
.ChatArea {
    box-sizing: border-box;
    padding-top: 20px;
    padding-bottom: 100px;
    $row-padding: 220px;
    padding-right: $row-padding;
    padding-left: $row-padding;
    height: 65vh;

    overflow-y: auto;

    &::-webkit-scrollbar {
        height: .4rem;
        width: .4rem;
    }

    &::-webkit-scrollbar-thumb {
        --tw-border-opacity: 1;
        background-color: rgba(236, 236, 236, .8);
        border-color: rgba(255, 255, 255, var(--tw-border-opacity));
        border-radius: 9999px;
        border-width: 1px;
    }
}
</style>
