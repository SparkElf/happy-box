<script setup lang="ts">
import {Form, FormItem,Required} from '@/components/Atom/Form/index';
import {Input} from '@/components/Atom/Input/index';
import {Button} from '@/components/Atom/Button/index';
import { ref } from 'vue';
import { useStoryConfig } from './store';
import { storeToRefs } from 'pinia';
import { onMounted } from 'vue';

const value=ref('')
const {theme}=storeToRefs(useStoryConfig())
const form$=ref<InstanceType<typeof Form>>()

function resetValid(){
  form$.value?.resetValid()
}
function valid(){
  form$.value?.valid()
}
</script>
<template>
    <Story  >
      <Variant title="Basic">
      <Form ref="form$">
        <FormItem label="手机号" :ruleProp="value" :rules="[new Required()] ">
          <Input placeholder="请输入手机号" v-model:value="value"/>
        </FormItem>
        <div class="ButtonGroup">
          <Button @click="resetValid">重置</Button>
          <Button @click="valid">提交</Button>
        </div>

      </Form>

    </Variant>
    <template #controls>
            <HstText v-model="theme" title="theme" />
    </template>
    </Story>
</template>
<docs lang="md">
  ## 设计要点
  1. Teleport使语义化插槽Label和ErrorMsg可以挂载到布局插槽Left、Top、Buttom、Right中
  2. valid函数
     - FormItem应该可以单独调用，Form可以集中调用(FormItem将自己的valid函数注册到Form的函数表中以方便集中调用)
     - valid必须是异步的
</docs>
<style lang="scss" scoped>

.Form{
  width: 200px;
}

</style>
