<script setup>
import { SyncLoader } from 'vue3-spinner'
defineOptions({
  name: 'easySpinner',
})
defineProps({
  // text: {
  //   type: String,
  //   default: '加载中',
  // },
  color: {
    type: String,
    default: 'rgba(122, 192, 199, 1)',
  },
})
</script>

<template>
  <div class="easy-spinner">
    <div class="spinner__inner">
      <SyncLoader :color="color" />
      <!-- <div class="spinner-text" :style="{ color: color }">{{ text }}</div> -->
    </div>
  </div>
</template>

<style scoped lang="less">
.easy-spinner {
  position: fixed;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
  .spinner__inner {
    position: absolute;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.8);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  .spinner-text {
    font-size: 0.4rem;
    margin-top: 0.2rem;
  }
}
</style>
