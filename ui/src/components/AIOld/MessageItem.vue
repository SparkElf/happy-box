<template>
    <div
      class="message-item"
      :class="{
        'user-message': message.role === 'user',
        'assistant-message': message.role === 'assistant',
        'system-message': message.role === 'system'
      }"
    >
      <!-- 消息头像 -->
      <div class="message-avatar">
        <el-avatar v-if="message.role === 'user'" :icon="UserFilled" :size="40" />
        <el-avatar v-else-if="message.role === 'assistant'" :icon="Cpu" :size="40" />
        <el-avatar v-else :icon="Warning" :size="40" />
      </div>

      <!-- 消息内容 -->
      <div class="message-content">
        <!-- 消息头部信息 -->
        <div class="message-header">
          <span class="message-role">{{ getRoleName(message.role) }}</span>
          <span class="message-time">{{ formatTime(message.timestamp) }}</span>
          <el-tag v-if="message.model" size="small" type="info">{{ message.model }}</el-tag>
        </div>

        <!-- 消息正文 -->
        <div class="message-body">
          <!-- 普通文本消息 -->
          <div
            v-if="!message.isMarkdown && message.role !== 'assistant'"
            class="message-text"
          >
            {{ message.content }}
          </div>

          <!-- Markdown渲染的消息 -->
          <div
            v-else
            class="message-text markdown-content"
            v-html="renderMarkdown(message.content)"
          />

          <!-- 代码块高亮显示 -->
          <div
            v-if="message.code"
            class="code-block"
          >
            <div class="code-header">
              <span class="code-language">{{ message.codeLanguage || 'text' }}</span>
              <el-button
                :icon="CopyDocument"
                size="small"
                text
                @click="copyCode(message.code)"
              >
                复制代码
              </el-button>
            </div>
            <pre><code :class="`language-${message.codeLanguage || 'text'}`">{{ message.code }}</code></pre>
          </div>

          <!-- 图片消息 -->
          <div v-if="message.images && message.images.length" class="message-images">
            <el-image
              v-for="(image, index) in message.images"
              :key="index"
              :src="image.url"
              :alt="image.alt || '图片'"
              fit="cover"
              class="message-image"
              :preview-src-list="message.images.map(img => img.url)"
              :initial-index="index"
            />
          </div>

          <!-- 文件附件 -->
          <div v-if="message.files && message.files.length" class="message-files">
            <div
              v-for="file in message.files"
              :key="file.id"
              class="file-item"
            >
              <el-icon><Document /></el-icon>
              <span class="file-name">{{ file.name }}</span>
              <span class="file-size">{{ formatFileSize(file.size) }}</span>
              <el-button
                :icon="Download"
                size="small"
                text
                @click="downloadFile(file)"
              >
                下载
              </el-button>
            </div>
          </div>
        </div>

        <!-- 消息操作按钮 -->
        <div class="message-actions">
          <el-button
            :icon="CopyDocument"
            size="small"
            text
            @click="copyMessage"
          >
            复制
          </el-button>

          <el-button
            v-if="message.role === 'assistant'"
            :icon="RefreshRight"
            size="small"
            text
            @click="regenerateMessage"
          >
            重新生成
          </el-button>

          <el-button
            v-if="message.role === 'assistant'"
            :icon="Star"
            size="small"
            text
            @click="favoriteMessage"
          >
            收藏
          </el-button>

          <el-dropdown @command="handleMoreAction">
            <el-button :icon="MoreFilled" size="small" text />
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="edit" v-if="message.role === 'user'">编辑</el-dropdown-item>
                <el-dropdown-item command="delete">删除</el-dropdown-item>
                <el-dropdown-item command="export">导出</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>

        <!-- 消息状态 -->
        <div v-if="message.status" class="message-status">
          <el-icon v-if="message.status === 'sending'" class="is-loading"><Loading /></el-icon>
          <el-icon v-else-if="message.status === 'error'" class="error-icon"><Warning /></el-icon>
          <el-icon v-else-if="message.status === 'sent'" class="success-icon"><Check /></el-icon>
          <span class="status-text">{{ getStatusText(message.status) }}</span>
        </div>
      </div>
    </div>
  </template>

  <script setup lang="ts">
  import { computed } from 'vue'
  import {
    UserFilled, Cpu, Warning, CopyDocument, RefreshRight,
    Star, MoreFilled, Document, Download, Loading, Check
  } from '@element-plus/icons-vue'
  import { ElMessage } from 'element-plus'

  // Props
  const props = defineProps({
    message: {
      type: Object,
      required: true
    }
  })

  // Emits
  const emit = defineEmits(['regenerate', 'copy', 'delete', 'edit', 'favorite'])

  // 计算属性
  const isUserMessage = computed(() => props.message.role === 'user')
  const isAssistantMessage = computed(() => props.message.role === 'assistant')

  // 方法
  const getRoleName = (role) => {
    const roleNames = {
      user: '你',
      assistant: 'AI助手',
      system: '系统'
    }
    return roleNames[role] || role
  }

  const formatTime = (timestamp) => {
    if (!timestamp) return ''

    const now = new Date()
    const messageTime = new Date(timestamp)
    const diff = now - messageTime

    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (days > 0) return `${days}天前`
    if (hours > 0) return `${hours}小时前`
    if (minutes > 0) return `${minutes}分钟前`
    return '刚刚'
  }

  const renderMarkdown = (content) => {
    if (!content) return ''

    // 简单的Markdown渲染（实际项目中建议使用marked或markdown-it）
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
      .replace(/\n/g, '<br>')
  }

  const copyMessage = async () => {
    try {
      await navigator.clipboard.writeText(props.message.content)
      ElMessage.success('已复制到剪贴板')
      emit('copy', props.message)
    } catch (error) {
      ElMessage.error('复制失败')
    }
  }

  const copyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code)
      ElMessage.success('代码已复制到剪贴板')
    } catch (error) {
      ElMessage.error('复制失败')
    }
  }

  const regenerateMessage = () => {
    emit('regenerate', props.message)
  }

  const favoriteMessage = () => {
    emit('favorite', props.message)
    ElMessage.success('已收藏')
  }

  const handleMoreAction = (command) => {
    switch (command) {
      case 'edit':
        emit('edit', props.message)
        break
      case 'delete':
        emit('delete', props.message)
        break
      case 'export':
        exportMessage()
        break
    }
  }

  const exportMessage = () => {
    const content = `${getRoleName(props.message.role)}: ${props.message.content}\n时间: ${formatTime(props.message.timestamp)}`
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `message-${props.message.id}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const downloadFile = (file) => {
    const a = document.createElement('a')
    a.href = file.url
    a.download = file.name
    a.click()
  }

  const getStatusText = (status) => {
    const statusTexts = {
      sending: '发送中...',
      sent: '已发送',
      error: '发送失败'
    }
    return statusTexts[status] || ''
  }
  </script>

  <style scoped>
  .message-item {
    display: flex;
    margin-bottom: 24px;
    max-width: 100%;
    animation: fadeInUp 0.3s ease-out;
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .user-message {
    flex-direction: row-reverse;
  }

  .user-message .message-content {
    background: linear-gradient(135deg, #409eff 0%, #6bb6ff 100%);
    color: white;
    margin-right: 12px;
    margin-left: 60px;
  }

  .assistant-message .message-content {
    background: #f8f9fa;
    border: 1px solid #e9ecef;
    margin-left: 12px;
    margin-right: 60px;
  }

  .system-message .message-content {
    background: #fff3cd;
    border: 1px solid #ffeaa7;
    margin: 0 60px;
  }

  .message-avatar {
    flex-shrink: 0;
  }

  .message-content {
    border-radius: 12px;
    padding: 16px;
    max-width: calc(100% - 120px);
    position: relative;
  }

  .message-header {
    display: flex;
    align-items: center;
    gap: 8px;
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

  .message-body {
    margin-bottom: 12px;
  }

  .message-text {
    line-height: 1.6;
    word-wrap: break-word;
    white-space: pre-wrap;
  }

  .markdown-content {
    /* Markdown样式 */
  }

  .markdown-content :deep(code) {
    background: rgba(0, 0, 0, 0.1);
    padding: 2px 6px;
    border-radius: 4px;
    font-family: 'Consolas', 'Monaco', monospace;
  }

  .markdown-content :deep(pre) {
    background: #f6f8fa;
    padding: 12px;
    border-radius: 8px;
    overflow-x: auto;
    margin: 8px 0;
  }

  .markdown-content :deep(a) {
    color: #409eff;
    text-decoration: none;
  }

  .markdown-content :deep(a:hover) {
    text-decoration: underline;
  }

  .code-block {
    margin: 12px 0;
    border-radius: 8px;
    overflow: hidden;
    background: #f6f8fa;
  }

  .code-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    background: #e9ecef;
    font-size: 12px;
  }

  .code-language {
    font-weight: 600;
    color: #6c757d;
  }

  .code-block pre {
    margin: 0;
    padding: 12px;
    overflow-x: auto;
  }

  .message-images {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin: 8px 0;
  }

  .message-image {
    max-width: 200px;
    max-height: 200px;
    border-radius: 8px;
  }

  .message-files {
    margin: 8px 0;
  }

  .file-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: rgba(0, 0, 0, 0.05);
    border-radius: 8px;
    margin-bottom: 4px;
  }

  .file-name {
    flex: 1;
    font-weight: 500;
  }

  .file-size {
    font-size: 12px;
    color: #6c757d;
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

  .message-status {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-top: 8px;
    font-size: 12px;
    opacity: 0.7;
  }

  .error-icon {
    color: #f56565;
  }

  .success-icon {
    color: #48bb78;
  }

  .status-text {
    font-size: 12px;
  }

  /* 响应式设计 */
  @media (max-width: 768px) {
    .user-message .message-content,
    .assistant-message .message-content,
    .system-message .message-content {
      margin-left: 12px;
      margin-right: 12px;
      max-width: calc(100% - 24px);
    }

    .message-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 4px;
    }
  }
  </style>