import { createPinia } from 'pinia'
import { defineSetupVue3 } from '@histoire/plugin-vue'
import WrapperGlobal  from '@/stories/HistoireApp.vue'
import { pinia } from './store'
import {vAnchor} from '@/directives/AnchorPosition'

export const setupVue3 = defineSetupVue3(({ app,addWrapper  }) => {
  addWrapper(WrapperGlobal )
  // Vue plugin
  app.use(pinia)
  app.directive('v-anchor', vAnchor)
  //wrapper https://histoire.dev/guide/vue3/wrapper.html

  // Global component
  //app.component('GlobalComponent', )

  // Global property
  //app.config.globalProperties.$t = (key) => translate(key)

  // Provide
  //app.provide('key', 'meow')

})
