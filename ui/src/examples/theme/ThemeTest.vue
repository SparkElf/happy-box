

<template>
  <div class="ThemeTest">
    <button @click="handleClick"></button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Themes } from './theme';
const theme=ref(Themes.LightTheme)
function handleClick(){
  if(theme.value.name=='LightTheme')theme.value=Themes.DarkTheme
  else theme.value=Themes.LightTheme
}

</script>
<style scoped lang="scss">
button{
    background-color: v-bind('theme.BtnSecondaryColor');
    width: 50px;
    height: 50px;
}
</style>
