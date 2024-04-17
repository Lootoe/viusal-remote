<script setup>
import { useScene, changeCameraSide, addMesh, addMeshes, destoryScene } from './hooks/useScene'
import { useNucleus, changeNucleusColor, changeNucleusVisible } from './hooks/useNucleus'
import { useChips } from './hooks/useChips'
import { useFibers } from './hooks/useFibers'
import { getAssets } from '@/utils/tools'

const tempAffineUrl = getAssets('optionalModels/matrix/affine.txt')
const tempFiberUrls = [getAssets('optionalModels/fiber/Lead_l.txt'), getAssets('optionalModels/fiber/Lead_r.txt')]

let nucleusList = ref([])
let nucleusMeshes = shallowRef([])
let leadList = shallowRef([])

const { initFibers, getAllFibers, hideAllFibers, analyseTraverse } = useFibers()

const resetFibers = () => {
  hideAllFibers()
}
const traverseFibers = (...args) => {
  const [type, arr] = args
  let source = ''
  if (type === 'confirm') {
    source = arr[0]
  }
  if (type === 'cross') {
    source = arr.join('&')
  }
  if (type === 'append') {
    source = arr.join('|')
  }
  analyseTraverse(source)
}
onMounted(() => {
  useScene('.main-scene', '.small-scene', { backgroundColor: '#232A3B' })
    .then(() => {
      return useNucleus()
    })
    .then(data => {
      nucleusList.value = data.nucleusList
      console.log('用于显示的核团列表', data.nucleusList)
      nucleusMeshes.value = data.nucleusMeshes
      console.log('用于追踪的核团列表', data.nucleusMeshes)
      addMeshes(Object.values(nucleusMeshes.value).map(v => v.mesh))
    })
    .then(() => {
      return useChips()
    })
    .then(leads => {
      console.log('最终渲染的电极列表', leads)
      leads.forEach(lead => {
        addMesh(lead.pole)
        addMeshes(lead.chips.map(v => v.mesh))
        addMeshes(lead.chips.map(v => v.electric))
      })
      leadList.value = leads
    })
    .then(() => {
      const arr_1 = nucleusMeshes.value
      const arr_2 = leadList.value
        .map(v => v.chips)
        .flat()
        .map(v => {
          return {
            name: v.name,
            mesh: v.electric,
          }
        })
      const traverseArr = arr_1.concat(arr_2)
      initFibers({
        affineUrl: tempAffineUrl,
        fiberUrlList: tempFiberUrls,
        traverseArr: traverseArr,
      }).then(() => {
        addMeshes(getAllFibers())
      })
    })
    .catch(err => {
      console.log('err', err)
    })
})
onBeforeUnmount(() => {
  destoryScene()
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
    <traverse-manager
      class="traverse-manager"
      :nucleusList="nucleusMeshes"
      :leadList="leadList"
      @reset="resetFibers"
      @traverse="traverseFibers"
    ></traverse-manager>
    <change-side class="change-side" @changeSide="changeCameraSide"></change-side>
    <div class="small-scene"></div>
  </div>
</template>

<style scoped lang="less">
.main-scene {
  position: fixed;
  width: 100vw;
  height: 100vh;
  user-select: none;
}
.small-scene {
  position: absolute;
  top: 0.16rem;
  right: 0.16rem;
  width: 2rem;
  height: 2rem;
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
.change-side {
  position: absolute;
  bottom: 0.36rem;
  right: 0.36rem;
}
</style>
