import { createPinia, defineStore } from "pinia";
import { ref } from "vue";
export const pinia=createPinia()
export const useStoryConfig=defineStore('StoryConfig',() =>{
    const theme=ref('GreenDark')
    return {theme}
})