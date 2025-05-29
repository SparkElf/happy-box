// chatApi.ts - 聊天API服务
import axios, { type AxiosInstance, type AxiosResponse } from 'axios'

// 类型定义
export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

export interface Chat {
  id: string
  title: string
  model: string
  createdAt: number
  updatedAt: number
  messages: Message[]
}

export interface Model {
  id: string
  name: string
  description?: string
  maxTokens?: number
}

export interface SendMessageParams {
  message: string
  model?: string
  history?: Message[]
  chatId?: string
}

export interface CreateChatParams {
  title?: string
  model?: string
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}

export interface StreamCallbacks {
  onMessage?: (data: any) => void
  onComplete?: () => void
  onError?: (error: string) => void
}

class ChatApiService {
  private api: AxiosInstance

  constructor(baseURL: string = '/api') {
    this.api = axios.create({
      baseURL,
      timeout: 30000, // 30秒超时
      headers: {
        'Content-Type': 'application/json'
      }
    })

    // 请求拦截器
    this.api.interceptors.request.use(
      (config) => {
        // 添加认证token
        const token = localStorage.getItem('auth_token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // 响应拦截器
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        return response.data
      },
      (error) => {
        console.error('API请求错误:', error)
        return Promise.reject(error)
      }
    )
  }

  /**
   * 发送聊天消息
   * @param params 发送消息参数
   */
  async sendMessage(params: SendMessageParams): Promise<ApiResponse<Message>> {
    try {
      const { message, model = 'gpt-4', history = [], chatId } = params
      const response = await this.api.post('/chat/completions', {
        message,
        model,
        history,
        chatId,
        stream: false
      })

      return {
        success: true,
        data: response
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || '发送消息失败'
      }
    }
  }

  /**
   * 流式发送消息（支持打字机效果）
   * @param params 发送消息参数
   * @param callbacks 回调函数
   */
  async sendMessageStream(
    params: SendMessageParams,
    callbacks: StreamCallbacks = {}
  ): Promise<void> {
    try {
      const { message, model = 'gpt-4', history = [], chatId } = params
      const { onMessage, onComplete, onError } = callbacks

      const response = await fetch(`${this.api.defaults.baseURL}/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders()
        },
        body: JSON.stringify({
          message,
          model,
          history,
          chatId
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('无法获取响应流')
      }

      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()

        if (done) {
          onComplete?.()
          break
        }

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') {
              onComplete?.()
              return
            }

            try {
              const parsed = JSON.parse(data)
              onMessage?.(parsed)
            } catch (e) {
              console.warn('解析流数据失败:', e)
            }
          }
        }
      }
    } catch (error: any) {
      console.error('流式请求错误:', error)
      callbacks.onError?.(error.message || '请求失败')
    }
  }

  /**
   * 创建新聊天
   * @param params 创建聊天参数
   */
  async createChat(params: CreateChatParams = {}): Promise<ApiResponse<Chat>> {
    try {
      const { title = '新对话', model = 'gpt-4' } = params
      const response = await this.api.post('/chat/create', {
        title,
        model
      })
      return {
        success: true,
        data: response
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || '创建聊天失败'
      }
    }
  }

  /**
   * 删除聊天
   * @param chatId 聊天ID
   */
  async deleteChat(chatId: string): Promise<ApiResponse> {
    try {
      const response = await this.api.delete(`/chat/${chatId}`)
      return {
        success: true,
        data: response
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || '删除聊天失败'
      }
    }
  }

  /**
   * 更新聊天标题
   * @param chatId 聊天ID
   * @param title 新标题
   */
  async updateChatTitle(chatId: string, title: string): Promise<ApiResponse<Chat>> {
    try {
      const response = await this.api.put(`/chat/${chatId}/title`, {
        title
      })
      return {
        success: true,
        data: response
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || '更新标题失败'
      }
    }
  }

  /**
   * 获取聊天历史
   * @param chatId 聊天ID
   */
  async getChatHistory(chatId: string): Promise<ApiResponse<Message[]>> {
    try {
      const response = await this.api.get(`/chat/history/${chatId}`)
      return {
        success: true,
        data: response
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || '获取聊天历史失败'
      }
    }
  }

  /**
   * 获取所有聊天列表
   */
  async getChatList(): Promise<ApiResponse<Chat[]>> {
    try {
      const response = await this.api.get('/chat/list')
      return {
        success: true,
        data: response
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || '获取聊天列表失败'
      }
    }
  }

  /**
   * 获取可用模型列表
   */
  async getModels(): Promise<ApiResponse<Model[]>> {
    try {
      const response = await this.api.get('/models')
      return {
        success: true,
        data: response
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || '获取模型列表失败'
      }
    }
  }

  /**
   * 获取聊天详情
   * @param chatId 聊天ID
   */
  async getChatDetail(chatId: string): Promise<ApiResponse<Chat>> {
    try {
      const response = await this.api.get(`/chat/${chatId}`)
      return {
        success: true,
        data: response
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || '获取聊天详情失败'
      }
    }
  }

  /**
   * 清除聊天记录
   * @param chatId 聊天ID
   */
  async clearChatHistory(chatId: string): Promise<ApiResponse> {
    try {
      const response = await this.api.delete(`/chat/${chatId}/messages`)
      return {
        success: true,
        data: response
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || '清除聊天记录失败'
      }
    }
  }

  /**
   * 获取认证头
   */
  getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('auth_token')
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  /**
   * 设置认证token
   * @param token 认证token
   */
  setAuthToken(token: string): void {
    localStorage.setItem('auth_token', token)
  }

  /**
   * 清除认证token
   */
  clearAuthToken(): void {
    localStorage.removeItem('auth_token')
  }

  /**
   * 检查是否已认证
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token')
  }

  /**
   * 设置基础URL
   * @param baseURL 基础URL
   */
  setBaseURL(baseURL: string): void {
    this.api.defaults.baseURL = baseURL
  }

  /**
   * 设置请求超时时间
   * @param timeout 超时时间（毫秒）
   */
  setTimeout(timeout: number): void {
    this.api.defaults.timeout = timeout
  }
}

// 创建默认实例
const chatApi = new ChatApiService()

export default chatApi
export { ChatApiService }