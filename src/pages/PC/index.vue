<script setup>
import useScene from './hooks/useScene'
useScene('.main-scene', '.small-scene', {})
  .then(sceneManager => {
    console.log('sceneManager', sceneManager)
  })
  .catch(err => {
    console.log('err', err)
  })
</script>

<template>
  <div class="main-scene">
    <div class="small-scene"></div>
  </div>
</template>

<style scoped lang="less">
.main-scene {
  position: fixed;
  width: 100vw;
  height: 100vh;
}
.small-scene {
  position: absolute;
  top: 0.16rem;
  right: 0.16rem;
  width: 1.66rem;
  height: 1.66rem;
}
</style>
