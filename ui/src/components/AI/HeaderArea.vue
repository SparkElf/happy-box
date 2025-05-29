<template>
  <div class="header-container">

    <!--    左侧  -->
    <a-popover placement="bottomLeft" :arrow="false" :open="popOpen"
       overlayClassName="custom-poper" :overlayInnerStyle="{transform: 'translate(10px, 10px)'}" >
      <template #content>
        <div class="container">
          <div class="search-content">
            <a-input v-model:value="modelSearch"
             placeholder="搜索模型"
             class="no-border-no-focus"
             @change="searchModel"
            >
              <template #prefix>
                <SearchOutlined />
              </template>
            </a-input>
          </div>
          <a-divider style="margin: 5px 0;"/>
          <div v-for="(item) in modelList" @click="changeModel(item)">
            <div :class="['model-line', { active: item.active }]" v-show="item.show">
              <div class="left">
                <div class="model-image">""</div>
                <div class="model-text">{{item.name}}</div>
                <div class="model-icon"><PaperClipOutlined /></div>
              </div>
              <div class="right" v-show="item.active">
                <CheckOutlined />
              </div>
            </div>
          </div>
        </div>
      </template>
      <div class="left-content" @click="popOpen=!popOpen">
        <div class="model-text">{{modelName}}</div>
        <DownOutlined style="margin: 5px 6px 0 6px;font-size: 8px;"/>
      </div>


      <a-float-button
          type="primary"
          :style="{
            right: '34px',
            height: '50px',
            width: '50px'
          }"
          @click="openDialog"
      >
        <template #icon>
          <RobotOutlined />
        </template>
      </a-float-button>
    </a-popover>
    <!--    右侧  -->
    <div class="right-content">
      <div class="icons">
        <div class="icon"><EllipsisOutlined /></div>
        <div class="icon"><ControlOutlined /></div>
        <div class="icon"><EllipsisOutlined /></div>
      </div>
    </div>
  </div>
</template>


<script setup lang="ts">
import {
  DownOutlined,SearchOutlined,PaperClipOutlined,CheckOutlined,RobotOutlined,EllipsisOutlined,ControlOutlined
} from '@ant-design/icons-vue';
import {ref,reactive,onMounted, inject} from 'vue'
import { message } from 'ant-design-vue';
import robotPic from '@/components/AI/robot.jpg'


// 模型选择弹出框
const popOpen = ref(false)
const modelName = inject('modelName');
function changeModel(clickedItem: any) {
  modelList.value.forEach(item => {
    item.active = (item.name === clickedItem.name);
    if (item.name === clickedItem.name) {
      modelName.value = clickedItem.name;
    }
  });
  popOpen.value = false
}

const modelSearch = ref('')

// 模型搜索
function searchModel() {
  const keyword = modelSearch.value.trim(); // 去掉前后空格
  modelList.value = modelList.value.map(model => {
    // 判断 name 是否以 item 开头（区分大小写）
    const shouldShow = keyword === '' || model.name.startsWith(keyword);

    return {
      ...model,
      show: shouldShow
    };
  });
}

const modelList = ref([
  {
    name: 'qwq',
    active: true,
    show: true
  },
  {
    name: 'qwen72',
    active: false,
    show: true
  },
  {
    name: 'deepseek-llama-70b',
    active: false,
    show: true
  }
])


// 右下角悬浮按钮
function openDialog() {
  message.success("openDialog!!!")
}


// 退出登陆
function logout() {
  message.success('logout!')
}

</script>



<style scoped lang="scss">

.header-container {
  //border: 1px solid red;
  //height: 50px;
  display: flex;
  justify-content: space-between;
  padding: 0 20px;
}
.left-content {
  display: flex;
  align-items: center;
  padding: 0 10px;
  width: 350px;
  border: 1px solid red;
  cursor: pointer;
  .model-text {
    font-family: "Georgia, serif", sans-serif;
    font-weight: 500;
    font-size: 16px;
    color: rgb(78,78,78);
  }
}
.right-content {
  width: 200px;
  border: 1px solid red;
  .icons {
    cursor: pointer;
    display: flex;
    justify-content: flex-end;
    .icon {
      margin: 0 8px;
      color: #676767;
      font-size: 20px;
      position: relative;
    }

  }
  //margin-right: 20px;
}
</style>
<style lang="scss">
.custom-poper {
  width: 512px;

  .search-content {
    //隐藏边框
    .no-border-no-focus {
      border: none;
      outline: none !important;
      box-shadow: none !important;
    }
  }
  .model-line  {
    display: flex;
    justify-content: space-between;
    border-radius: 10px;
    cursor: pointer;
    &:hover {background-color: rgb(236,236,236);}
    padding: 10px;
    .left {
      display: flex;
      align-items: center;
      .model-text {
        font-family: "Georgia, serif", sans-serif;
        color: rgb(78,78,78);
        font-weight: 500;
      }
      .model-icon {
        margin-left: 5px;
        font-size: 12px;
      }
    }

  }
}
</style>
