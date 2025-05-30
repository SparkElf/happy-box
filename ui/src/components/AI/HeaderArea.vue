<template>
  <div class="header-container">

    <!--    左侧  -->
    <a-popover placement="bottomLeft" :arrow="false" v-model:open="popOpen" trigger="click"
       overlayClassName="custom-poper-left" :overlayInnerStyle="{transform: 'translate(10px, -10px)'}" >
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
                <div class="model-image">
                  <a-image width="20px" :src="robotPic" class="model-mini-image" />
                </div>
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
        <PlusOutlined style="margin: 5px 6px 0 6px;font-size: 8px;"/>
      </div>

    </a-popover>
    <!--    右侧  -->
    <div class="right-content">
      <div class="icons">
        <div class="icon"><EllipsisOutlined /></div>
        <div class="icon"><ControlOutlined /></div>
        <a-popover placement="bottomRight" :arrow="false" trigger="click"
             overlayClassName="custom-poper-right" :overlayInnerStyle="{transform: 'translate(10px, 0)'}" >
          <div class="user-info"></div>
          <template #content>
            <div class="info-line"  @click="logout">
              <div class="icon"><LogoutOutlined /></div>
              <div class="text">登出</div>
            </div>
          </template>
        </a-popover>
      </div>
    </div>


  </div>
</template>


<script setup lang="ts">
import {
  DownOutlined,SearchOutlined,PaperClipOutlined,CheckOutlined,
  RobotOutlined,EllipsisOutlined,ControlOutlined,LogoutOutlined,
  PlusOutlined
} from '@ant-design/icons-vue';
import {ref,reactive,onMounted, inject} from 'vue'
import { message } from 'ant-design-vue';
import robotPic from '@/components/AI/robot.jpg'
import Icon from "@/components/Atom/Image/Icon.vue";


// 模型选择弹出框
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




// 右下角悬浮按钮
function openDialog() {
  message.success("openDialog!!!")
}


// 退出登陆
function logout() {
  message.success('logout!')
}

// 新增对话
function addNew() {
  message.success('addNew!')
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
  //width: 350px;
  cursor: pointer;
  .model-text {
    font-family: "Georgia, serif", sans-serif;
    font-weight: 500;
    font-size: 18px;
    color: rgb(78,78,78);
  }
}
.right-content {
  width: 200px;
  //border: 1px solid red;
  .icons {
    cursor: pointer;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    .icon {
      margin: 0 10px;
      color: #676767;
      font-size: 20px;
      position: relative;
    }
    .icon::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 40px; /* 圆形直径 */
      height: 40px;
      background-color: rgba(128, 128, 128, 0.3); /* 灰色半透明背景 */
      border-radius: 50%;
      opacity: 0;
      transition: opacity 0.3s ease;
      z-index: 1; /* 确保在图标上方 */
    }
    .icon:hover::after {
      opacity: 1;
      transition: opacity 0.2s ease-in-out;
    }
    .user-info {
      width: 30px;
      height: 30px;
      background-color: #f39c12;
      border-radius: 50%;
      margin: 0 10px;
    }
    .user-info:hover {
      opacity: 0.8;
    }
  }
  //margin-right: 20px;
}
</style>
<style lang="scss">
.custom-poper-left {
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
      .model-mini-image {
        height: 20px;
        width: 20px;
        object-fit: cover;

      }
      .model-text {
        margin-left: 10px;
        font-family: "Georgia, serif", sans-serif;
        color: rgb(78,78,78);
        font-weight: 500;
      }
      .model-icon {
        margin-left: 5px;
        font-size: 15px;
      }
    }

  }
}
.custom-poper-right {
  width: 150px;
  .info-line {
    cursor: pointer;
    height: 30px;
    display: flex;
    align-items: center;
    border-radius: 3px;
    .text {
      margin-left: 15px;
    }
    &:hover {
      background-color: rgb(236,236,236);
    }
  }
}
</style>
