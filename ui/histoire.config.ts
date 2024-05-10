import { defineConfig } from 'histoire'
import { HstVue } from '@histoire/plugin-vue'

export default defineConfig({
  setupFile: 'src/stories/histoire.setup.ts',
  plugins: [
    HstVue(),
  ],
  vite:{
    mode:'mock',
    build:{
      sourcemap:true
    }
  }
})
