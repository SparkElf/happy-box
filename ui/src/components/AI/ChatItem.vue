<template>
    <div class="ChatItem" :class="{ 'UserRole': role === 'user', 'BotRole': role === 'assistant' }">
        <div class="Avatar">
            <img :src="avatar || AvatarImg" alt="Avatar" />
            <div v-if="role === 'user'" class="UserName">{{ userName }}</div>
            <div v-else class="UserName">机器人</div>
            <div v-if="role === 'assistant'" class="BotIcon">🤖</div>
            <el-tag round v-if="role === 'assistant'" class="ModelName" style="margin-left: 10px">{{ modelName
                }}</el-tag>
        </div>
        <div class="Pipeline" v-if="role === 'assistant'">
            <a-collapse v-model:activeKey="activeKey" :bordered="false" style="background: rgb(255, 255, 255)">
                <template #expandIcon="{ isActive }">
                    <div class="StepsHeader" style="display:flex;align-items: center;">
                        <a-spin v-if="currentStep?.status == 'running'" size="small"></a-spin>
                        <a-result v-if="currentStepIndex == steps.length - 1 && currentStep?.status == 'completed'"
                            status="success"></a-result>
                        <!-- <caret-right-outlined :rotate="isActive ? 90 : 0" style="margin-right: 10px;" /> -->
                        <span style="font-size: 14px;margin-left: 10px;color: #7a7a7a;">{{ currentStep?.name ?? '未知错误'
                            }}</span>
                    </div>
                </template>
                <a-collapse-panel key="1" :style="'background: #fff;border-radius: 4px;border: 0;overflow: hidden'" v-if="steps.length > 0">
                    <a-steps style="min-width: 500px;padding-left:10px;padding-top: 10px;;" size="small"
                        :current="currentStepIndex" :items="props.steps.map(item => ({ title: item.name }))"></a-steps>
                </a-collapse-panel>
            </a-collapse>

        </div>
        <div class="Content">
            <span class="Text markdown-body " data-theme="light" v-html="renderedContent"></span>
            <!-- <div class="Time">{{ time }}</div> -->
        </div>
    </div>
</template>
<script lang="ts" setup>
import AvatarImg from './avatar.jpg';
import RobotImg from './robot.jpg';
import { computed, ref, watch, withDefaults } from 'vue';
import { marked } from 'marked'; // 引入 marked 库
import type { Step } from './type';
import { CaretRightOutlined } from '@ant-design/icons-vue';

const props = withDefaults(defineProps<{
    role?: 'user' | 'assistant';
    content?: string;
    time?: string;
    userName?: string;
    modelName?: string;
    steps?: Step[];
}>(), {
    role: 'user',
    content: '**空内容**',
    time: new Date().toLocaleTimeString(),
    userName: 'User',
    modelName: 'Qwen3',
    steps: () => []
    //steps: () => [{ id: 0, name: '示例步骤1', content: '这是一个示例步骤', status: 'completed' }, { id: 1, name: '示例步骤2', content: '这是一个示例步骤2', status: 'running' }, { id: 0, name: '示例步骤3', content: '这是一个示例步骤3', status: 'not-started' }]
});
watch(() => props, (newContent) => {
    console.log('内容更新:', newContent);
}, { immediate: true }); // 立即执行一次





// 使用 computed 属性来生成渲染后的 Markdown 内容
const renderedContent = computed(() => {
  const content = props.content || '';

  // 判断是否为单句（比如不含换行）
  if (!content.includes('\n')) {
    return marked.parseInline(content);
  }

  return marked.parse(content);
});
const activeKey = ref<string[]>(['0']);
const currentStepIndex = computed(() => {
    return props.steps.findIndex(item => item.status != 'completed')
});
const currentStep = computed(() => {
    return currentStepIndex.value != -1 ? props.steps[currentStepIndex.value] : null
});
const avatar = computed(() => {
    return props.role === 'user' ? AvatarImg : RobotImg; // 如果是用户角色，返回空字符串，否则返回默认头像
});
</script>
<style lang="scss">
@import './markdown.css';
</style>
<style lang="scss" scoped>
.ChatItem {
    display: flex;
    margin-bottom: 10px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;

    &.BotRole {

        .Avatar {
            img {
                margin-right: 10px;
            }
        }

        .Content {
            background-color: transparent;
            padding-left: 2px;
            padding-right: 0;
        }
    }

    &.UserRole {
        align-items: flex-end;

        .Avatar {
            flex-direction: row-reverse;

            img {
                margin-left: 10px;
            }
        }



    }

    .Avatar {
        $avatarSize: 25px;
        width: $avatarSize;
        height: $avatarSize;

        display: flex;
        white-space: nowrap;
        align-items: center;
        margin-bottom: 10px;

        img {
            width: 100%;
            height: 100%;
            border-radius: 50%;

        }

        .UserName {

            font-weight: bold;
        }

        .ModelName {
            font-size: 11px;
            height: 18px;
        }
    }

    .Content {
        max-width: 70%;
        background-color: #f0f0f0;
        padding: 10px;
        border-radius: 5px;

        .Text {
            //margin-bottom: 5px;
           // text-align: center;
            height: 100%;


        }

        .Time {
            font-size: 12px;
            color: #888;
            text-align: right;
        }
    }

    .Pipeline {
        ::v-deep(.ant-collapse>.ant-collapse-item >.ant-collapse-header) {
            padding: 5px;
        }
    }


}
</style>