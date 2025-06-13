<template>
  <div class="header-container">

    <!--    左侧  -->
      <div class="left-content" >
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
              <div v-for="(item) in modelMenuList" @click="changeModel(item)">
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
        <div class=popper-area @click="popOpen=!popOpen">
          <div class="model-text">{{modelName}}</div>
          <DownOutlined style="margin: 5px 0 0 6px;font-size: 8px;"/>
        </div>
        </a-popover>
        <a-tooltip placement="bottom" trigger="hover">
          <template #title>新建对话</template>
          <PlusOutlined style="font-size: 8px;" class="new-chat" @click="newChat"/>
        </a-tooltip>
      </div>

    <!--    右侧  -->
    <div class="right-content">
      <div class="icons">
        <div class="icon"><EllipsisOutlined /></div>
        <!-- <a-tooltip>
                <template #title v-if="!stream" placement="bottom">开启流式回复</template>
                <template #title v-else placement="bottom">关闭流式回复</template>
                <div class="icon" @click="stream = !stream" ><ControlOutlined /></div>
        </a-tooltip> -->

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
import {ref,reactive,onMounted, inject, watch} from 'vue'
import { message } from 'ant-design-vue';
import robotPic from './robot.jpg'
// import Icon from "@/components/Atom/Image/Icon.vue";
import { getModelListApi } from './aichat_api';
const currentChatId = inject('currentChatId'); // 获取当前聊天 ID
const modelList = inject('modelList'); // 获取模型列表
const needRefreshHistoryList = inject('needRefreshHistoryList'); // 获取是否需要刷新聊天记录列表
// 模型选择弹出框
const modelMenuList = ref([] as any[]); // 模型菜单列表
const modelName = inject('modelName');
const popOpen = ref(false)
const stream = inject('stream'); // 获取流式响应状态
const messages = inject('messages'); // 获取消息列表
watch(() => modelList.value, (newValue) => {
  modelMenuList.value = newValue.map((item,index) => ({
    name: item.modelName,
    active: index === 0, // 默认第一个模型为选中状态
    show: true
  }));
  if(modelMenuList.value.length > 0)
    modelName.value = modelMenuList.value[0].name; // 默认选中第一个模型
}, { immediate: true });


function changeModel(clickedItem: any) {
  modelMenuList.value.forEach(item => {
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
  modelMenuList.value = modelMenuList.value.map(model => {
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

// import { useUserStore } from '@/store/modules/user';
// 退出登陆
function logout() {

  // console.log(useUserStore().roles)
  message.success('logout!')
}

// 新增对话
function newChat() {
  //message.success('newChat!')
  currentChatId.value = null; // 清空当前聊天 ID
  messages.value = []; // 清空消息列表
  needRefreshHistoryList.value = true; // 设置标志，表示需要刷新聊天记录列表
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
  //cursor: pointer;
  .popper-area {
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
      user-select: none;
    }
  }
  .new-chat {
    cursor: pointer;
    margin-top: 3px;
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
        user-select: none;
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
      user-select: none;
    }
    &:hover {
      background-color: rgb(236,236,236);
    }
  }
}
</style>
