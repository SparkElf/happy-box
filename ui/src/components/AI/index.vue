<template>
    <div class="AIChat">
        <a-layout :style="{ minHeight: props.height }">
            <SideBar />
            <a-layout>
                <a-layout-header style="background: #fff; padding: 0">
                    <HeaderArea></HeaderArea>
                </a-layout-header>
                <a-layout-content style="margin: 0 0px">
                    <ChatArea />
                </a-layout-content>
                <div class="InputBox">
                    <a-textarea v-model:value="inputValue" placeholder="问我任何消息" :rows="4"
                      @keydown.enter.native="sendMsg">
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
import { onMounted, provide, ref, watch } from 'vue';
import { chatApi, getAiChatBaseInfoApi, getModelListApi, chatStreamApi } from './aichat_api'
import SendIcon from './SendIcon.vue';
import { message } from 'ant-design-vue';
import HeaderArea from "@/components/AI/HeaderArea.vue";

const props = defineProps({
    height: {
        type: [String, Number],
        default: '100%'
    }
})
console.log(props.height, 'props.height')
const inputValue = ref('');
const loading = ref(false);
const messages = ref([] as any[]);
const currentChatId = ref(null)
const modelName = ref("未知模型")
const needRefreshHistoryList = ref(false); // 用于标记是否需要刷新聊天记录列表
const modelList = ref([] as any[]); // 模型列表
const stream = ref(true); // 是否开启流式响应
provide('messages', messages)
provide('currentChatId', currentChatId);
provide('modelName', modelName);
provide('needRefreshHistoryList', needRefreshHistoryList)
provide('modelList', modelList); // 提供模型列表
provide('stream', stream); // 提供流式响应状态
onMounted(async () => {
    // 获取模型列表
    const res = await getModelListApi();
    if (res.status !== 200) {
        message.error('获取模型列表失败');
        return;
    }
    modelList.value = res.data; // 设置模型列表
    console.log('模型列表:', modelList.value);
});
let chunkCnt = 0;
const currentChatType = ref('chat') // 当前聊天类型
const sqlQueryResult = ref() // SQL查询结果
let startChat = false
let responseId:string = ''
let firstChunkStr = ''
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
function waitChat() {
  responseId = generateUUID();
  messages.value = [...messages.value, { role: 'user', content: inputValue.value, type: 'text' }]
  messages.value = [
    ...messages.value,
    { role: 'assistant', content: '', type: 'text', id:responseId, last:true, sqlQueryResult: {} }
  ];
}
const sqlQueryResultMock = {title: [
  {
    a: '1',
    b: '2'
  },
  {
    a: '3',
    b: '4'
  },
  {
    a: '5',
    b: '6'
  }
]}
function clearChunkResult() {
    chunkCnt = 0;
    sqlQueryResult.value = null;
    currentChatType.value = 'chat';
    startChat = false
    responseId = ''
}
function onChunk(chunk, fullText) {
    console.log('Received chunk:', chunk);
    chunkCnt++;
    if (chunkCnt === 1) {
        firstChunkStr = chunk
        const meta = JSON.parse(chunk)

        currentChatType.value = meta.type
        sqlQueryResult.value = meta.sqlQueryResult
        //sqlQueryResult.value = sqlQueryResultMock
        messages.value = messages.value.map((item,index) => {
            if(index == messages.value.length - 1) {
              item.sqlQueryResult = sqlQueryResult.value
            }
            return item
        })
        console.log(messages.value,'messages.value')
        responseId = meta.responseId
        if (currentChatId.value === null) {
            // 如果当前聊天 ID 为空，则设置为返回的 chatId
            currentChatId.value = parseInt(meta.chatId);
            needRefreshHistoryList.value = true; // 设置标志，表示需要刷新聊天记录列表
        }
        console.log('当前聊天类型:', currentChatType.value);
        return
    }


    if (startChat==false) {
        // messages.value = [...messages.value, { role: 'user', content: inputValue.value, type: 'text' }]
        inputValue.value = ''
        startChat=true
    }
    // 这里可以处理接收到的 chunk 数据
    console.log('Full text:', fullText, firstChunkStr);
    if(fullText.startsWith(firstChunkStr)) {
      console.log('Full text:', fullText, firstChunkStr);
      fullText = fullText.slice(firstChunkStr.length);
    }
    // 例如，将 chunk 添加到消息列表中
    if (messages.value[messages.value.length - 1].role === 'assistant') {
         // 删除最后一个元素
    // messages.value = messages.value.slice(0, -1);
    // 添加新的 assistant 消息
        messages.value[messages.value.length - 1].content = fullText
    }
    // else {
    //     messages.value[messages.value.length - 1].content = fullText
    // }

}

function onComplete() {
    console.log('Stream completed');
    loading.value = false; // 重置加载状态
    message.success('消息发送成功');
    messages.value.forEach((item, index) => {
      item.last = index === messages.value.length -1
    })
}
watch(messages.value, (newVal, oldVal) => {
    console.log('messages changed:', newVal);
})
async function sendMsg() {

    if (loading.value) {
        return; // 如果正在加载，则不发送新消息
    }
    if (inputValue.value.trim() === '') {
        return;
    }
    if (modelName.value === "未知模型") {
        message.error('请选择模型');
        return;
    }
    loading.value = true; // 设置加载状态
    if (stream.value) {
        // 这里可以添加发送消息的逻辑
        try {
            console.log(messages,'messages!!!!!!!!!!!!!!')
            //messages.value = [...messages.value, { role: 'user', content: inputValue.value, type: 'text' }, { role: 'assistant', content: '', type: 'text' }]; // 更新消息列表
            clearChunkResult();
            waitChat()
            console.log(responseId, '!!!!!!!!!!',{
              messages: [...messages.value, { role: 'user', content: inputValue.value, type: 'text' }],
              chatId: currentChatId.value,
              modelName: modelName.value,
              responseId: responseId,
              onChunk,
              onComplete
            })
            try {
                await chatStreamApi({
                    messages: [...messages.value.slice(0, -1)],
                    chatId: currentChatId.value,
                    modelName: modelName.value,
                    responseId: responseId,
                    onChunk,
                    onComplete
                });
            } catch (e:any) {
                message.info(e)
            }

        } catch (error) {
            console.error('发送消息失败:', error);
            message.error('发送消息失败');
            loading.value = false; // 重置加载状态
            return;
        }


        return;
    }
    else {
        // 这里可以添加发送消息的逻辑
        const res = await chatApi({
            messages: [...messages.value, { role: 'user', content: inputValue.value, type: 'text' }],
            chatId: currentChatId.value,
            modelName: modelName.value,
            stream: false // 关闭流式响应
        });
        if (res.status !== 200) {
            message.error('发送消息失败:');
            loading.value = false; // 重置加载状态
            return;
        }
        if (currentChatId.value === null) {
            // 如果当前聊天 ID 为空，则设置为返回的 chatId
            currentChatId.value = res.data.chatId;
            needRefreshHistoryList.value = true; // 设置标志，表示需要刷新聊天记录列表
        }

        messages.value = [...messages.value, { role: 'user', content: inputValue.value, type: 'text' }, { role: 'assistant', content: res.data.message, type: 'text' }]; // 更新消息列表
        console.log('发送结果:', res);
        console.log('发送消息:', inputValue.value);
        inputValue.value = ''; // 清空输入框
    }


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
    top: v-bind("currentChatId ? '78%' : '50%'");
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
