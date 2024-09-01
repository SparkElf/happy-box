import type { AjaxResponse, PageResponse, SingleResponse } from '@/types/ruoyi'
import axios, { type AxiosRequestConfig } from 'axios'
import { ElMessage  } from 'element-plus'


const service = axios.create({
    headers: {
    },
    baseURL: import.meta.env.VITE_GRAPH_SERVER_BASE_URL,
    timeout: 15000
})

// request interceptor
service.interceptors.request.use(
    config => {
        config.headers['Content-Type'] = 'application/x-www-form-urlencoded'
        if (config.headers['Content-Type'] === 'multipart/form-data;charse=UTF-8') {
            config.headers['Content-Type'] = config.headers['Content-Type']
        }
        return config
    },
    error => {
        return Promise.reject(error)
    }
)

// response interceptor
service.interceptors.response.use(
    response => {
        const res = response.data
        if (res.status === 'success') {
            return res
        } else if (res.status === 'fail') {
            ElMessage({
                message: res.errMsg,
                type: 'error',
                showClose: true
            })
            return false
        } else if (res.status === 'error') {
            ElMessage({
                message: res.errMsg,
                type: 'error',
                showClose: true
            })
            return false
        } else if (res.status === 404) {
            ElMessage({
                message: '未找到该资源',
                type: 'error',
                showClose: true
            })
            return false
        }
        if (res.code === 403) { // token过期
            ElMessage({
                message: '请重新登录',
                type: 'warning',
                showClose: true
            })
            setTimeout(() => {
                localStorage.clear()
                window.location.href = '/'
            }, 2000)
        }
        return res
    },
    error => {
        console.log(error, 'error')
        if (error && error.response) {
            error.response.data = error.response.data || {}
            const map = {
                400: '错误请求',
                401: '无权访问',
                403: '拒绝访问',
                404: '请求错误，未找到该资源',
                405: '请求方法未允许',
                408: '请求超时',
                500: '服务器端出错',
                501: '网络未实现',
                502: '网络错误',
                503: '服务不可用',
                504: '网络超时',
                505: 'http版本不支持该请求'
            }
            if (error.response.status === 400 || error.response.status === 401 || error.response.status === 403) {

            }
            if (error.response.status === 404) {

            }
            error.response.data.msg = map[error.response.status] || '连接服务器失败'
        }
        return Promise.reject((error.response && error.response.data) || { msg: '网络出现问题，请稍后再试' }) // 返回接口返回的错误信息

    }
)




export function request<Type extends 'single'|'page',ResponseData=any>(config:AxiosRequestConfig){
  return service<any,Type extends 'single'?SingleResponse<ResponseData>: Type extends 'page'?PageResponse<ResponseData>:never,any>(config)
}
export default request
