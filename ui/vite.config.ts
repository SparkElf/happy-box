import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  define:{
    __DEV__:true,//echarts环境变量
    'import.meta.vitest': 'undefined',
  },
  server: {
    port: process.env.HISTOIRE ? 6007 : 3000,
  },
  build:{
    sourcemap:true
  },
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
