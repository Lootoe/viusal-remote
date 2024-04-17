<script setup>
import useScene from './hooks/useScene'
import useNucleus from './hooks/useNucleus'
import useChips from './hooks/useChips'
import useFibers from './hooks/useFibers'

const tempAffineUrl = 'optionalModels/matrix/affine.txt'
const tempFiberUrls = ['optionalModels/fiber/Lead_l.txt', 'optionalModels/fiber/Lead_r.txt']
const tempLeadUrl = 'optionalModels/leads/lead.json'
const tempPatientConfig = {
  leftChannel: {
    implantList: [
      {
        brain: 1,
        lead: 6,
        // 电极编号
        position: 2,
      },
    ],
  },
  rightChannel: {
    implantList: [
      {
        brain: 0,
        lead: 9,
        // 电极编号
        position: 1,
      },
    ],
  },
}
const tempProgram = {
  leftChannel: [
    {
      nodes: [
        {
          index: 0,
          node: 1,
          color: '#845EC2',
          amplitude: 0,
          width: 0,
          rate: 0,
        },
        {
          index: 1,
          node: 1,
          color: '#F3C5FF',
          amplitude: 0,
          width: 0,
          rate: 0,
        },
        {
          index: 4,
          node: 0,
          color: '#00C9A7',
          amplitude: 0,
          width: 0,
          rate: 0,
        },
        {
          index: 5,
          node: 1,
          color: '#FEFEDF',
          amplitude: 0,
          width: 0,
          rate: 0,
        },
      ],
      display: 1,
      position: 2,
    },
  ],
  rightChannel: [
    {
      nodes: [
        {
          index: 2,
          node: 0,
          color: '',
          amplitude: 0,
          width: 0,
          rate: 0,
        },
        {
          index: 3,
          node: 0,
          color: '',
          amplitude: 0,
          width: 0,
          rate: 0,
        },
        {
          index: 6,
          node: 1,
          color: '#845EC2',
          amplitude: 0,
          width: 0,
          rate: 0,
        },
        {
          index: 7,
          node: 2,
          color: '#D65DB1',
          amplitude: 0,
          width: 0,
          rate: 0,
        },
        {
          index: 8,
          node: 0,
          color: '#FF6F91',
          amplitude: 0,
          width: 0,
          rate: 0,
        },
        {
          index: 9,
          node: 0,
          color: '#FF9671',
          amplitude: 0,
          width: 0,
          rate: 0,
        },
        {
          index: 10,
          node: 2,
          color: '#FFC75F',
          amplitude: 0,
          width: 0,
          rate: 0,
        },
        {
          index: 11,
          node: 0,
          color: '#F9F871',
          amplitude: 0,
          width: 0,
          rate: 0,
        },
      ],
      display: 1,
      position: 1,
    },
  ],
}
const tempUrlList = [
  'optionalModels/nucleus/Left-Caudate.ply',
  'optionalModels/nucleus/Left-Lenticula.ply',
  'optionalModels/nucleus/Left-NAc.ply',
  'optionalModels/nucleus/Left-ALIC.ply',
  'optionalModels/nucleus/Right-Caudate.ply',
  'optionalModels/nucleus/Right-Lenticula.ply',
  'optionalModels/nucleus/Right-NAc.ply',
  'optionalModels/nucleus/Right-ALIC.ply',
]

let nucleusList = ref([])
let nucleusMeshes = shallowRef([])
let leadList = shallowRef([])
let loadingText = ref('加载中')
let loading = ref(true)
let hasTraversed = ref(false)

const { initFibers, getAllFibers, hideAllFibers, analyseTraverse } = useFibers()
const { initChips, updateChips } = useChips()
const { initNucleus, changeNucleusVisible, changeNucleusColor } = useNucleus()
const { initScene, changeCameraSide, addMeshes, addMesh, destoryScene } = useScene()

const resetFibers = () => {
  hideAllFibers()
}

const traverseFibers = () => {
  return new Promise((resolve, reject) => {
    if (hasTraversed.value === false) {
      loading.value = true
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
      })
        .then(() => {
          addMeshes(getAllFibers())
          loading.value = false
          hasTraversed.value = true
          resolve()
        })
        .catch(reject)
    } else {
      loading.value = true
      setTimeout(() => {
        resolve()
        loading.value = false
      }, 500)
    }
  })
}

const traverse = (...args) => {
  traverseFibers().then(() => {
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
  })
}

onMounted(() => {
  loading.value = true
  initScene({ mainSelector: '.main-scene', smallSelector: '.small-scene', config: { backgroundColor: '#232A3B' } })
    .then(() => {
      return initNucleus({ urlList: tempUrlList }).then(data => {
        nucleusList.value = data.nucleusList
        console.log('用于显示的核团列表', data.nucleusList)
        nucleusMeshes.value = data.nucleusMeshes
        console.log('用于追踪的核团列表', data.nucleusMeshes)
        addMeshes(Object.values(nucleusMeshes.value).map(v => v.mesh))
      })
    })
    .then(() => {
      return initChips({ leadUrl: tempLeadUrl, patientConfig: tempPatientConfig, patientProgram: tempProgram }).then(
        data => {
          console.log('最终渲染的电极列表', data)
          data.forEach(lead => {
            addMesh(lead.pole)
            addMeshes(lead.chips.map(v => v.mesh))
            addMeshes(lead.chips.map(v => v.electric))
          })
          leadList.value = data
        }
      )
    })
    .then(() => {
      setTimeout(() => {
        loading.value = false
      }, 500)
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
    <easy-spinner :text="loadingText" v-show="loading"></easy-spinner>
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
      @traverse="traverse"
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
