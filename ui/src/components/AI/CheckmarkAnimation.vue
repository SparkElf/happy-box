<template>
  <div 
    class="checkmark-animation"
    :style="{
      width: `${size}px`,
      height: `${size}px`,
      '--checkmark-color': color,
      '--circle-color': circleColor,
      '--animation-duration': `${duration}ms`
    }"
    @click="triggerAnimation"
  >
    <svg 
      class="checkmark" 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 52 52"
      :class="{ 'animate': isAnimating }"
    >
      <circle class="checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
      <path class="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
    </svg>
    
    <div class="tooltip" v-if="showTooltip">
      点击可重新播放动画
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, watch } from 'vue';

export default defineComponent({
  name: 'CheckmarkAnimation',
  props: {
    // 图标尺寸（像素）
    size: {
      type: Number,
      default: 17,
      validator: (value: number) => value > 20
    },
    // 打勾颜色
    color: {
      type: String,
      default: 'green'
    },
    // 圆圈颜色
    circleColor: {
      type: String,
      default: 'green'
    },
    // 动画持续时间（毫秒）
    duration: {
      type: Number,
      default: 1800,
      validator: (value: number) => value >= 500 && value <= 5000
    },
    // 是否自动播放
    autoPlay: {
      type: Boolean,
      default: true
    },
    // 是否显示提示
    showTooltip: {
      type: Boolean,
      default: true
    }
  },
  setup(props) {
    const isAnimating = ref(false);
    
    // 触发动画
    const triggerAnimation = () => {
      isAnimating.value = false;
      setTimeout(() => {
        isAnimating.value = true;
      }, 50);
    };
    
    // 自动播放
    onMounted(() => {
      if (props.autoPlay) {
        setTimeout(() => {
          isAnimating.value = true;
        }, 500);
      }
    });
    
    // 监听尺寸变化
    watch(() => props.size, () => {
      if (props.autoPlay) {
        triggerAnimation();
      }
    });
    
    return {
      isAnimating,
      triggerAnimation
    };
  }
});
</script>

<style scoped>
.checkmark-animation {
  position: relative;
  margin: 0 auto;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.checkmark-animation:hover {
  transform: scale(1.05);
}

.checkmark {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  display: block;
  stroke-width: 3;
  stroke: #fff;
  stroke-miterlimit: 10;
}

.checkmark-circle {
  stroke-dasharray: 166;
  stroke-dashoffset: 166;
  stroke-width: 3;
  stroke: var(--circle-color);
  fill: none;
}

.checkmark-check {
  transform-origin: 50% 50%;
  stroke-dasharray: 48;
  stroke-dashoffset: 48;
  stroke: var(--checkmark-color);
}

/* 动画状态 */
.checkmark.animate .checkmark-circle {
  animation: stroke-animation calc(var(--animation-duration) * 0.5) cubic-bezier(0.65, 0, 0.45, 1) forwards;
}

.checkmark.animate .checkmark-check {
  animation: 
    stroke-animation calc(var(--animation-duration) * 0.3) cubic-bezier(0.65, 0, 0.45, 1) calc(var(--animation-duration) * 0.5) forwards,
    fill-animation calc(var(--animation-duration) * 0.2) ease-in-out calc(var(--animation-duration) * 0.7) forwards;
}

.checkmark.animate {
  animation: 
    fill-circle-animation calc(var(--animation-duration) * 0.2) ease-in-out calc(var(--animation-duration) * 0.5) forwards, 
    scale-animation calc(var(--animation-duration) * 0.2) ease-in-out calc(var(--animation-duration) * 0.8) both;
}

/* 动画定义 */
@keyframes stroke-animation {
  100% {
    stroke-dashoffset: 0;
  }
}

@keyframes fill-animation {
  100% {
    box-shadow: inset 0px 0px 0px 60px var(--checkmark-color);
  }
}

@keyframes fill-circle-animation {
  100% {
    box-shadow: inset 0px 0px 0px 30px rgba(76, 175, 80, 0.1);
  }
}

@keyframes scale-animation {
  0%, 100% {
    transform: none;
  }
  50% {
    transform: scale3d(1.1, 1.1, 1);
  }
}

.tooltip {
  position: absolute;
  bottom: -30px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.checkmark-animation:hover .tooltip {
  opacity: 1;
}
</style>