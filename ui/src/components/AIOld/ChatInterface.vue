<template>
    <div class="chat-container">
      <!-- 侧边栏 -->
      <div class="sidebar" :class="{ collapsed: sidebarCollapsed }">
        <div class="sidebar-header">
          <el-button
            :icon="sidebarCollapsed ? Expand : Fold"
            @click="toggleSidebar"
            circle
            size="small"
          />
          <span v-if="!sidebarCollapsed" class="logo">AI Chat</span>
        </div>

        <div class="sidebar-content" v-if="!sidebarCollapsed">
          <el-button
            type="primary"
            @click="startNewChat"
            style="width: 100%; margin-bottom: 16px;"
            :icon="Plus"
          >
            新建对话
          </el-button>

          <div class="chat-history">
            <div class="history-title">历史对话</div>
            <div
              v-for="chat in chatHistory"
              :key="chat.id"
              class="history-item"
              :class="{ active: currentChatId === chat.id }"
              @click="switchChat(chat.id)"
            >
              <div class="history-item-title">{{ chat.title }}</div>
              <div class="history-item-time">{{ formatTime(chat.updatedAt) }}</div>
              <el-button
                :icon="Delete"
                size="small"
                text
                @click.stop="deleteChat(chat.id)"
                class="delete-btn"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 主聊天区域 -->
      <div class="main-chat">
        <!-- 聊天头部 -->
        <div class="chat-header">
          <div class="chat-title">
            <span>{{ currentChat?.title || '新对话' }}</span>
            <el-tag v-if="currentChat?.model" size="small" type="info">
              {{ currentChat.model }}
            </el-tag>
          </div>
          <div class="chat-actions">
            <el-dropdown @command="handleModelChange">
              <el-button :icon="Setting">
                选择模型 <el-icon><arrow-down /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="gpt-4">GPT-4</el-dropdown-item>
                  <el-dropdown-item command="gpt-3.5-turbo">GPT-3.5 Turbo</el-dropdown-item>
                  <el-dropdown-item command="claude-3">Claude-3</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <el-button :icon="Delete" @click="clearCurrentChat">清空对话</el-button>
          </div>
        </div>

        <!-- 消息列表 -->
        <div class="message-list" ref="messageListRef">
          <div v-if="!currentMessages.length" class="empty-state">
            <el-empty description="开始你的AI对话吧！" />
          </div>

          <div
            v-for="message in currentMessages"
            :key="message.id"
            class="message-item"
            :class="{ 'user-message': message.role === 'user', 'assistant-message': message.role === 'assistant' }"
          >
            <div class="message-avatar">
              <el-avatar v-if="message.role === 'user'" :icon="UserFilled" />
              <el-avatar v-else :icon="Cpu" />
            </div>
            <div class="message-content">
              <div class="message-header">
                <span class="message-role">{{ message.role === 'user' ? '你' : 'AI助手' }}</span>
                <span class="message-time">{{ formatTime(message.timestamp) }}</span>
              </div>
              <div class="message-text">
                <div v-if="message.role === 'assistant'" v-html="formatMarkdown(message.content)"></div>
                <div v-else>{{ message.content }}</div>
              </div>
              <div class="message-actions">
                <el-button :icon="CopyDocument" size="small" text @click="copyMessage(message.content)">复制</el-button>
                <el-button v-if="message.role === 'assistant'" :icon="RefreshRight" size="small" text @click="regenerateMessage(message.id)">重新生成</el-button>
              </div>
            </div>
          </div>

          <!-- 加载中状态 -->
          <div v-if="isLoading" class="message-item assistant-message">
            <div class="message-avatar">
              <el-avatar :icon="Cpu" />
            </div>
            <div class="message-content">
              <div class="message-header">
                <span class="message-role">AI助手</span>
              </div>
              <div class="message-text">
                <div class="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 输入区域 -->
        <div class="input-area">
          <div class="input-container">
            <el-input
              v-model="inputMessage"
              type="textarea"
              :rows="3"
              placeholder="输入你的消息... (Shift+Enter换行，Enter发送)"
              @keydown="handleKeydown"
              :disabled="isLoading"
              resize="none"
            />
            <div class="input-actions">
              <el-button
                type="primary"
                :icon="Promotion"
                @click="sendMessage"
                :loading="isLoading"
                :disabled="!inputMessage.trim()"
              >
                发送
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>

  <script setup lang="ts">
  import { ref, reactive, computed, nextTick, onMounted } from 'vue'
  import {
    Plus, Delete, Setting, Expand, Fold, UserFilled, Cpu,
    CopyDocument, RefreshRight, Promotion, ArrowDown
  } from '@element-plus/icons-vue'
  import { ElMessage } from 'element-plus'

  // 响应式数据
  const sidebarCollapsed = ref(false)
  const inputMessage = ref('')
  const isLoading = ref(false)
  const messageListRef = ref()
  const currentChatId = ref(null)

  // 聊天数据
  const chatHistory = ref([
    {
      id: '1',
      title: '关于Vue.js的讨论',
      model: 'gpt-4',
      updatedAt: new Date(Date.now() - 1000 * 60 * 30), // 30分钟前
      messages: [
        {
          id: '1-1',
          role: 'user',
          content: 'Vue.js 3.0有哪些新特性？',
          timestamp: new Date(Date.now() - 1000 * 60 * 30)
        },
        {
          id: '1-2',
          role: 'assistant',
          content: 'Vue.js 3.0 引入了很多重要的新特性：\n\n1. **Composition API** - 提供了更灵活的代码组织方式\n2. **更好的性能** - 重写了虚拟DOM，提升了渲染性能\n3. **更小的包体积** - 通过tree-shaking减少了打包体积\n4. **更好的TypeScript支持** - 原生支持TypeScript\n\n这些改进让Vue.js变得更加强大和易用。',
          timestamp: new Date(Date.now() - 1000 * 60 * 29)
        }
      ]
    }
  ])

  const messages = reactive(new Map())

  // 计算属性
  const currentChat = computed(() => {
    return chatHistory.value.find(chat => chat.id === currentChatId.value)
  })

  const currentMessages = computed(() => {
    if (!currentChatId.value) return []
    return messages.get(currentChatId.value) || currentChat.value?.messages || []
  })

  // 方法
  const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  const startNewChat = () => {
    const newChatId = Date.now().toString()
    const newChat = {
      id: newChatId,
      title: '新对话',
      model: 'gpt-4',
      updatedAt: new Date(),
      messages: []
    }
    chatHistory.value.unshift(newChat)
    messages.set(newChatId, [])
    currentChatId.value = newChatId
  }

  const switchChat = (chatId) => {
    currentChatId.value = chatId
    if (!messages.has(chatId)) {
      const chat = chatHistory.value.find(c => c.id === chatId)
      messages.set(chatId, chat?.messages || [])
    }
  }

  const deleteChat = (chatId) => {
    const index = chatHistory.value.findIndex(chat => chat.id === chatId)
    if (index > -1) {
      chatHistory.value.splice(index, 1)
      messages.delete(chatId)
      if (currentChatId.value === chatId) {
        currentChatId.value = chatHistory.value[0]?.id || null
      }
    }
  }

  const clearCurrentChat = () => {
    if (currentChatId.value && messages.has(currentChatId.value)) {
      messages.set(currentChatId.value, [])
      const chat = chatHistory.value.find(c => c.id === currentChatId.value)
      if (chat) {
        chat.messages = []
        chat.updatedAt = new Date()
      }
    }
  }

  const handleModelChange = (model) => {
    if (currentChat.value) {
      currentChat.value.model = model
      ElMessage.success(`已切换到 ${model}`)
    }
  }

  const sendMessage = async () => {
    if (!inputMessage.value.trim() || isLoading.value) return

    if (!currentChatId.value) {
      startNewChat()
    }

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage.value.trim(),
      timestamp: new Date()
    }

    // 添加用户消息
    const currentMsgs = messages.get(currentChatId.value) || []
    currentMsgs.push(userMessage)
    messages.set(currentChatId.value, [...currentMsgs])

    // 更新聊天标题
    const chat = chatHistory.value.find(c => c.id === currentChatId.value)
    if (chat && chat.title === '新对话') {
      chat.title = inputMessage.value.slice(0, 20) + (inputMessage.value.length > 20 ? '...' : '')
    }

    const userInput = inputMessage.value
    inputMessage.value = ''
    isLoading.value = true

    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1500))

      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: generateMockResponse(userInput),
        timestamp: new Date()
      }

      const updatedMsgs = messages.get(currentChatId.value) || []
      updatedMsgs.push(assistantMessage)
      messages.set(currentChatId.value, [...updatedMsgs])

      if (chat) {
        chat.updatedAt = new Date()
        chat.messages = [...updatedMsgs]
      }

      scrollToBottom()
    } catch (error) {
      ElMessage.error('发送失败，请重试')
    } finally {
      isLoading.value = false
    }
  }

  const generateMockResponse = (input) => {
    const responses = [
      `关于"${input}"，这是一个很好的问题。让我来为您详细解答：\n\n这个问题涉及多个方面，我会从不同角度来分析。首先，我们需要考虑基本概念和原理。其次，实际应用中的注意事项也很重要。\n\n希望这个回答对您有帮助！如果您还有其他问题，请随时提问。`,
      `您提到的"${input}"确实是一个重要的话题。\n\n**主要要点：**\n1. 首先需要理解基础概念\n2. 然后考虑实际应用场景\n3. 最后关注最佳实践\n\n这样的方法能够帮助您更好地理解和应用相关知识。`,
      `感谢您的提问关于"${input}"。\n\n根据我的理解，这个问题可以从以下几个维度来看：\n\n- **理论层面**：基础概念和原理\n- **实践层面**：具体操作和应用\n- **优化层面**：性能和效率提升\n\n如果您需要更深入的解答，请告诉我具体想了解哪个方面。`
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  const regenerateMessage = async (messageId) => {
    if (isLoading.value) return

    const currentMsgs = messages.get(currentChatId.value) || []
    const messageIndex = currentMsgs.findIndex(msg => msg.id === messageId)

    if (messageIndex > 0) {
      const userMessage = currentMsgs[messageIndex - 1]

      isLoading.value = true
      try {
        await new Promise(resolve => setTimeout(resolve, 1500))

        const newResponse = generateMockResponse(userMessage.content)
        currentMsgs[messageIndex] = {
          ...currentMsgs[messageIndex],
          content: newResponse,
          timestamp: new Date()
        }

        messages.set(currentChatId.value, [...currentMsgs])

        const chat = chatHistory.value.find(c => c.id === currentChatId.value)
        if (chat) {
          chat.messages = [...currentMsgs]
          chat.updatedAt = new Date()
        }
      } catch (error) {
        ElMessage.error('重新生成失败，请重试')
      } finally {
        isLoading.value = false
      }
    }
  }

  const copyMessage = async (content) => {
    try {
      await navigator.clipboard.writeText(content)
      ElMessage.success('已复制到剪贴板')
    } catch (error) {
      ElMessage.error('复制失败')
    }
  }

  const handleKeydown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      sendMessage()
    }
  }

  const scrollToBottom = () => {
    nextTick(() => {
      if (messageListRef.value) {
        messageListRef.value.scrollTop = messageListRef.value.scrollHeight
      }
    })
  }

  const formatTime = (date) => {
    const now = new Date()
    const diff = now - date
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (days > 0) return `${days}天前`
    if (hours > 0) return `${hours}小时前`
    if (minutes > 0) return `${minutes}分钟前`
    return '刚刚'
  }

  const formatMarkdown = (content) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br>')
  }

  // 初始化
  onMounted(() => {
    if (chatHistory.value.length > 0) {
      switchChat(chatHistory.value[0].id)
    }
  })
  </script>

  <style scoped>
  .chat-container {
    display: flex;
    height: 100vh;
    background: #f5f5f5;
  }

  .sidebar {
    width: 280px;
    background: white;
    border-right: 1px solid #e4e7ed;
    transition: width 0.3s ease;
    display: flex;
    flex-direction: column;
  }

  .sidebar.collapsed {
    width: 60px;
  }

  .sidebar-header {
    padding: 16px;
    border-bottom: 1px solid #e4e7ed;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .logo {
    font-size: 18px;
    font-weight: bold;
    color: #409eff;
  }

  .sidebar-content {
    flex: 1;
    padding: 16px;
    overflow-y: auto;
  }

  .chat-history {
    margin-top: 16px;
  }

  .history-title {
    font-size: 14px;
    color: #909399;
    margin-bottom: 12px;
    font-weight: 500;
  }

  .history-item {
    padding: 12px;
    border-radius: 8px;
    cursor: pointer;
    position: relative;
    margin-bottom: 8px;
    transition: background-color 0.2s ease;
  }

  .history-item:hover {
    background: #f0f9ff;
  }

  .history-item.active {
    background: #409eff;
    color: white;
  }

  .history-item-title {
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 4px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .history-item-time {
    font-size: 12px;
    opacity: 0.7;
  }

  .delete-btn {
    position: absolute;
    top: 8px;
    right: 8px;
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  .history-item:hover .delete-btn {
    opacity: 1;
  }

  .main-chat {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: white;
  }

  .chat-header {
    padding: 16px 24px;
    border-bottom: 1px solid #e4e7ed;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: white;
  }

  .chat-title {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .chat-title span {
    font-size: 18px;
    font-weight: 600;
  }

  .chat-actions {
    display: flex;
    gap: 12px;
  }

  .message-list {
    flex: 1;
    overflow-y: auto;
    padding: 24px;
  }

  .empty-state {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .message-item {
    display: flex;
    margin-bottom: 32px;
    max-width: 100%;
  }

  .user-message {
    flex-direction: row-reverse;
  }

  .user-message .message-content {
    background: #409eff;
    color: white;
    margin-right: 16px;
    margin-left: 80px;
  }

  .assistant-message .message-content {
    background: #f8f9fa;
    margin-left: 16px;
    margin-right: 80px;
  }

  .message-avatar {
    flex-shrink: 0;
  }

  .message-content {
    border-radius: 12px;
    padding: 16px;
    max-width: calc(100% - 120px);
  }

  .message-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  .message-role {
    font-size: 14px;
    font-weight: 600;
  }

  .message-time {
    font-size: 12px;
    opacity: 0.7;
  }

  .message-text {
    line-height: 1.6;
    margin-bottom: 12px;
    word-wrap: break-word;
  }

  .message-actions {
    display: flex;
    gap: 8px;
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  .message-item:hover .message-actions {
    opacity: 1;
  }

  .user-message .message-actions {
    justify-content: flex-end;
  }

  .typing-indicator {
    display: flex;
    gap: 4px;
    align-items: center;
  }

  .typing-indicator span {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #409eff;
    animation: typing 1.4s infinite ease-in-out;
  }

  .typing-indicator span:nth-child(2) {
    animation-delay: 0.2s;
  }

  .typing-indicator span:nth-child(3) {
    animation-delay: 0.4s;
  }

  @keyframes typing {
    0%, 80%, 100% {
      transform: scale(0.8);
      opacity: 0.5;
    }
    40% {
      transform: scale(1);
      opacity: 1;
    }
  }

  .input-area {
    padding: 24px;
    border-top: 1px solid #e4e7ed;
    background: white;
  }

  .input-container {
    position: relative;
  }

  .input-actions {
    position: absolute;
    bottom: 12px;
    right: 12px;
  }

  :deep(.el-textarea__inner) {
    padding-right: 80px !important;
    resize: none !important;
  }

  /* 响应式设计 */
  @media (max-width: 768px) {
    .sidebar {
      position: absolute;
      z-index: 1000;
      height: 100%;
    }

    .sidebar.collapsed {
      transform: translateX(-100%);
      width: 280px;
    }

    .user-message .message-content,
    .assistant-message .message-content {
      margin-left: 16px;
      margin-right: 16px;
      max-width: calc(100% - 32px);
    }
  }
  </style>