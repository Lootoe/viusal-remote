<script setup>
import useScene from './hooks/useScene'
import { useNucleus, changeNucleusColor, changeNucleusVisible } from './hooks/useNucleus'
let nucleusMeshes = []
let nucleusList = ref([])
onMounted(() => {
  let sceneManager
  useScene('.main-scene', '.small-scene', {})
    .then(data => {
      sceneManager = data
      return useNucleus()
    })
    .then(data => {
      nucleusList.value = data.nucleusList
      console.log('用于显示的核团列表', data.nucleusList)
      nucleusMeshes = data.nucleusMeshes
      console.log('用于追踪的核团列表', nucleusMeshes)
      Object.values(nucleusMeshes).forEach(item => {
        sceneManager.scene.add(item.mesh)
      })
    })
    .catch(err => {
      console.log('err', err)
    })
})
</script>
<template>
  <div class="main-scene">
    <nucleus-manager
      class="nucleus-manager"
      :nucleusList="nucleusList"
      @colorChanged="changeNucleusColor"
      @visibleChanged="changeNucleusVisible"
    ></nucleus-manager>
    <traverse-manager class="traverse-manager" :nucleusList="nucleusMeshes"></traverse-manager>
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
.nucleus-manager {
  position: absolute;
  top: 0.36rem;
  left: 0.36rem;
}
.traverse-manager {
  position: absolute;
  bottom: 0.36rem;
  left: 0.36rem;
}
</style>
