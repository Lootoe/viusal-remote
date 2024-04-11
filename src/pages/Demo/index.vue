<script setup>
import useScene from './hooks/useScene'
import useNucleus from './hooks/useNucleus'
import { onMounted } from 'vue'
onMounted(() => {
  let sceneManager, nucleusList
  useScene('.main-scene', '.small-scene', {})
    .then(data => {
      sceneManager = data
      return useNucleus()
    })
    .then(data => {
      nucleusList = data
      nucleusList.forEach(nucleus => {
        sceneManager.scene.add(nucleus.mesh)
      })
    })
    .catch(err => {
      console.log('err', err)
    })
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
