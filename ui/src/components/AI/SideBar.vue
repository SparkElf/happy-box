<template>
    <a-layout-sider v-model:collapsed="collapsed" collapsible theme="light" style="padding-bottom: 0;">
        <div class="header" style="margin-bottom: 20px;">
            <a-tooltip>
                <template #title v-if="!collapsed" placement="topRight">折叠侧边栏</template>
                <template #title v-else placement="topRight">展开侧边栏</template>
                <AlignLeftOutlined style="cursor: pointer;" @click="collapsed = !collapsed" />
            </a-tooltip>
            <span style="position: absolute; left:50%;transform:translateX(-50%);" v-if="!collapsed">邕警智搜智能体</span>
        </div>
        <!-- 搜索输入框 -->
        <div v-if="!collapsed" class="SearchBox">
            <a-input v-model:value="searchText" placeholder="搜索历史记录" allow-clear>
                <template #suffix>
                    <SearchIcon style="color: #999;cursor: pointer;" @click="onSearch" />
                </template>
            </a-input>
        </div>
        <a-menu v-model:selectedKeys="selectedKeys" theme="light" mode="inline" v-if="!collapsed"
            style="background-color: transparent; border: none;" >
            <template v-for="item in filteredChatHistoryList" :key="item.chatId">
                <a-menu-item @click="currentChatId = item.chatId">
                    <span>{{ item.title || '无标题' }}</span>
                </a-menu-item>
            </template>
        </a-menu>
    </a-layout-sider>
</template>
<script lang="ts" setup>
import {
    AlignLeftOutlined
} from '@ant-design/icons-vue';
import { ref, computed, onMounted, inject, type Ref, watch } from 'vue';
import { getChatHistoryListApi } from './aichat_api';
import SearchIcon from './SearchIcon.vue';
const collapsed = ref<boolean>(false);
const selectedKeys = ref<string[]>([]);

const chatHistoryList = ref<any[]>([]);
const searchText = ref<string>('');
const currentChatId = inject('currentChatId') as Ref<number | null>; // 获取当前聊天 ID
const needRefreshHistoryList = inject('needRefreshHistoryList') as Ref<boolean>; // 获取是否需要刷新聊天记录列表
// 搜索过滤
const filteredChatHistoryList = computed(() => {
    if (!searchText.value) return chatHistoryList.value;
    return chatHistoryList.value.filter(item =>
        (item.title || '无标题').toLowerCase().includes(searchText.value.toLowerCase())
    );
});
watch(() => currentChatId.value, (newValue) => {
    console.log('当前点击选中的聊天 ID:', newValue);
}, { immediate: true }); // 立即执行一次
watch(() => filteredChatHistoryList.value, (newValue) => {
    console.log('过滤后的聊天记录列表:', newValue);
})
watch(() => needRefreshHistoryList.value, async (newValue) => {
    if (newValue) {
        await getChatHistoryList();
        console.log('刷新聊天记录列表',filteredChatHistoryList.value);
        needRefreshHistoryList.value = false; // 重置标志
    }
}, { immediate: true }); // 立即执行一次
function onSearch() {
    // 这里可以扩展为远程搜索，当前为本地过滤
}
async function getChatHistoryList() {
    // 假设 userId 为 1，实际可根据登录用户动态获取
    const userId = 1;
    try {
        const res = await getChatHistoryListApi({ userId });
        if (Array.isArray(res.data)) {
            chatHistoryList.value = res.data;
            console.log('聊天记录列表:', chatHistoryList.value);
            if (chatHistoryList.value.length > 0) {
                selectedKeys.value = [];
                if (currentChatId.value) {
                    selectedKeys.value = [currentChatId.value?.toString() ];
                }

                console.log('当前选中的聊天 ID:', selectedKeys.value);
            }
        }
    } catch (e) {
        chatHistoryList.value = [];
    }
}
onMounted(async () => {
    await getChatHistoryList()
});
</script>
<style scoped lang="scss">
#components-layout-demo-side .logo {
    height: 32px;
    margin: 16px;
    background: rgba(255, 255, 255, 0.3);
}

.site-layout .site-layout-background {
    background: #fff;
}

::v-deep(.ant-layout-sider-trigger) {
    display: none;
}

::v-deep(.ant-layout-sider-light.ant-layout-sider-collapsed .ant-layout-sider-children) {
    border: none;

}

::v-deep(.ant-layout-sider-children) {
    background-color: v-bind("collapsed ? '#fff' : '#f1f6fe'");
    padding: 10px;

}


.SearchBox {
    ::v-deep(.ant-input-affix-wrapper) {
        border: 1px solid #dce8fc !important;
        outline: none;
        background-color: transparent;

        input {
            background-color: transparent;
        }
    }


}
</style>
