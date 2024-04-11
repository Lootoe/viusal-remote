<script setup>
defineOptions({
  name: 'Home',
})
import { useCounterStore } from '@/store/counter'
const countStore = useCounterStore()
const { count, doubleCount } = storeToRefs(countStore)
const increment = countStore.increment
const randomizeCounter = countStore.randomizeCounter
</script>

<template>
  <div class="center">
    <n-gradient-text type="info" :size="24">单倍：{{ count }}</n-gradient-text>
    <n-gradient-text type="info" :size="24">双倍：{{ doubleCount }}</n-gradient-text>
    <n-button type="primary" secondary @click="increment">加一</n-button>
    <n-button type="primary" secondary @click="randomizeCounter">随机</n-button>
  </div>
</template>

<style scoped lang="less">
.center {
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
</style>
