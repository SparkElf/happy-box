<script setup lang="ts">
import Elf from "@/components/icons/Elf.vue";

</script>

<template>
  <div class="HappyBox App">
    <div class="LoginBox">
      <div class="Left">
        <Elf></Elf>
      </div>
      <div class="Right">

      </div>
    </div>

  </div>
</template>

<style lang="scss" scoped>
//scoped做App级别的样式隔离
@import "@/themes/GreenDark.scss";

.LoginBox{
  @include defaultRow;
}
</style>
