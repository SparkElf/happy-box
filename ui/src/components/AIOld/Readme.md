# AI聊天界面组件

一个基于 Vue 3 + Element Plus 的现代化 AI 聊天界面组件，类似 Open WebUI 的设计风格。

## 功能特性

- 🎨 **现代化设计** - 简洁美观的界面，支持明暗主题
- 💬 **实时聊天** - 支持实时消息发送和接收
- 📱 **响应式布局** - 适配桌面端和移动端
- 🔄 **流式响应** - 支持流式消息显示（打字机效果）
- 📝 **Markdown支持** - 支持富文本消息渲染
- 💾 **历史记录** - 自动保存聊天历史
- 🔍 **多模型支持** - 支持切换不同的AI模型
- 📋 **消息操作** - 复制、重新生成、收藏等功能
- 🎯 **可定制** - 支持主题和配置自定义

## 目录结构

```
src/components/AI/
├── index.vue              # 入口组件
├── ChatInterface.vue      # 主聊天界面
├── MessageItem.vue        # 消息组件
├── chatApi.js            # API服务
└── README.md             # 说明文档
```

## 安装使用

### 1. 安装依赖

确保你的项目已安装以下依赖：

```bash
npm install vue@^3.0.0
npm install element-plus
npm install axios
```

### 2. 组件引入

在你的 Vue 项目中引入组件：

```vue
<template>
  <div class="app">
    <!-- 全屏聊天界面 -->
    <AIChat />

    <!-- 或者指定高度 -->
    <div style="height: 600px;">
      <AIChat
        :api-url="/api"
        :default-model="gpt-4"
        :show-sidebar="true"
        theme="light"
      />
    </div>
  </div>
</template>

<script setup>
import AIChat from '@/components/AI/index.vue'
</script>
```

### 3. 样式引入

确保在你的项目中引入了 Element Plus 的样式：

```javascript
// main.js
import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'

const app = createApp(App)
app.use(ElementPlus)
app.mount('#app')
```

## 组件配置

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| apiUrl | API请求基础URL | String | '/api/chat' |
| defaultModel | 默认使用的AI模型 | String | 'gpt-4' |
| theme | 主题模式 | String | 'light' |
| showSidebar | 是否显示侧边栏 | Boolean | true |

### 事件

| 事件名 | 说明 | 参数 |
|--------|------|------|
| message-sent | 消息发送完成 | (message) |
| message-received | 收到AI回复 | (message) |
| chat-created | 创建新对话 | (chatId) |
| chat-deleted | 删除对话 | (chatId) |

## API接口

组件需要后端提供以下API接口：

### 1. 发送消息

```
POST /api/chat/completions
Content-Type: application/json

{
  "message": "用户消息内容",
  "model": "gpt-4",
  "history": [...], // 历史消息
  "chatId": "chat_id"
}
```

### 2. 流式响应（可选）

```
POST /api/chat/stream
Content-Type: application/json

{
  "message": "用户消息内容",
  "model": "gpt-4",
  "history": [...],
  "chatId": "chat_id"
}
```

### 3. 聊天管理

```
GET /api/chat/list           # 获取聊天列表
POST /api/chat/create        # 创建新聊天
DELETE /api/chat/:id         # 删除聊天
PUT /api/chat/:id/title      # 更新聊天标题
GET /api/chat/history/:id    # 获取聊天历史
```

### 4. 模型管理

```
GET /api/models              # 获取可用模型列表
```

## 自定义主题

组件支持自定义主题，你可以通过CSS变量来修改样式：

```css
:root {
  --ai-chat-primary-color: #409eff;
  --ai-chat-bg-color: #ffffff;
  --ai-chat-sidebar-bg: #f8f9fa;
  --ai-chat-message-bg: #f0f2f5;
  --ai-chat-user-message-bg: #409eff;
  --ai-chat-border-color: #e4e7ed;
  --ai-chat-text-color: #303133;
  --ai-chat-text-secondary: #909399;
}

/* 暗色主题 */
[data-theme="dark"] {
  --ai-chat-bg-color: #1a1a1a;
  --ai-chat-sidebar-bg: #2d2d2d;
  --ai-chat-message-bg: #3d3d3d;
  --ai-chat-border-color: #4a4a4a;
  --ai-chat-text-color: #ffffff;
  --ai-chat-text-secondary: #cccccc;
}
```

## 高级功能

### 1. 自定义消息渲染

你可以通过插槽自定义消息的渲染：

```vue
<AIChat>
  <template #message="{ message }">
    <CustomMessageComponent :message="message" />
  </template>
</AIChat>
```

### 2. 添加插件

组件支持插件扩展：

```javascript
// 在chatApi.js中添加插件
import { ChatApiService } from '@/components/AI/chatApi.js'

const chatApi = new ChatApiService('/api')

// 添加请求拦截器
chatApi.api.interceptors.request.use((config) => {
  // 添加自定义逻辑
  return config
})
```

### 3. 消息中间件

可以添加消息处理中间件：

```javascript
// 消息发送前处理
const beforeSend = (message) => {
  // 处理消息内容
  return message
}

// 消息接收后处理
const afterReceive = (message) => {
  // 处理AI回复
  return message
}
```

## 常见问题

### Q: 如何接入不同的AI服务？

A: 修改 `chatApi.js` 中的请求格式和URL，适配你使用的AI服务接口。

### Q: 如何保存聊天记录到数据库？

A: 在API接口中实现数据库存储逻辑，组件会自动调用相应的接口。

### Q: 如何添加文件上传功能？

A: 可以在输入区域添加文件上传组件，并在API中处理文件上传逻辑。

### Q: 如何实现多语言支持？

A: 使用Vue i18n，将所有文本内容替换为多语言键值。

## 浏览器兼容性

- Chrome >= 88
- Firefox >= 85
- Safari >= 14
- Edge >= 88

## 开发计划

- [ ] 支持语音输入和输出
- [ ] 支持图片上传和识别
- [ ] 支持插件系统
- [ ] 支持更多消息类型
- [ ] 支持团队协作功能

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request 来改进这个组件。

## 更新日志

### v1.0.0
- 初始版本发布
- 基础聊天功能
- 响应式设计
- Markdown支持