<template>
    <Story>
        <Variant title="鼠标滚轮缩放测试">
            <div class="Wrapper">
                <div class="
                " style="width: 400px; height: 400px; background-color: red;" ref="scalableDiv$">
                </div>
            </div>
        </Variant>
    </Story>
</template>
<script setup lang="ts">
import { onMounted, ref, shallowRef } from 'vue';
const scalableDiv$ = shallowRef();
import LogicFlow from "@logicflow/core";
import "@logicflow/core/lib/style/index.css";

function render(){
     // 准备图数据
     const data = {
      // 节点数据
      nodes: [
        {
          id: '21', // 节点ID，需要全局唯一，不传入内部会自动生成一个ID
          type: 'rect', // 节点类型，可以传入LogicFlow内置的7种节点类型，也可以注册自定义节点后传入自定义类型
          x: 100, // 节点形状中心在x轴位置
          y: 100, // 节点形状中心在y轴的位置
          text: 'Origin Usage-rect', // 节点文本
          properties: { // 自定义属性，用于存储需要这个节点携带的信息，可以传入宽高以重设节点的宽高
            width: 160,
            height: 80,
          }
        },
        {
          id: '50',
          type: 'circle',
          x: 300,
          y: 300,
          text: 'Origin Usage-circle',
          properties: {
            r: 60,
          }
        },
      ],
      // 边数据
      edges: [
        {
          id: 'rect-2-circle', // 边ID，性质与节点ID一样
          type: 'polyline', // 边类型
          sourceNodeId: '50', // 起始节点Id
          targetNodeId: '21', // 目标节点Id
        },
      ],
    }

    // 创建画布实例，也可以 new Core.LogicFLow
    const lf = new LogicFlow({
      container: scalableDiv$.value,
      // width: 700, // 宽高和容器存一即可
      // height: 500, // 如果二者同时存在，会优先取设置的宽高
      grid: true,
    })

    // 渲染画布实例
    lf.render(data)
}

function addScaleListener(){

        let scale = 1; // 初始缩放比例
        // 添加鼠标滚轮事件监听器
        scalableDiv$.value.addEventListener('wheel', (event) => {
            // 阻止默认滚动行为
            event.preventDefault();

            // 计算新的缩放比例
            if (event.deltaY < 0) {
                // 向上滚动，放大
                scale += 0.1;
            } else {
                // 向下滚动，缩小
                scale -= 0.1;
            }

            // 确保缩放比例不低于 0.1
            if (scale < 0.1) {
                scale = 0.1;
            }

            // 应用缩放变换
            scalableDiv$.value.style.transform = `scale(${scale})`;
        });

}
onMounted(() => {
    console.log(scalableDiv$.value)
    if (scalableDiv$.value) {
        addScaleListener()
        render()
    }

})
</script>
<style lang="scss" scoped></style>
