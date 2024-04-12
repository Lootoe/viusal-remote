import * as THREE from 'three'
import { loadPLY } from '@/utils/loaders'

const urlList = [
  'optionalModels/nucleus/Left-Caudate.ply',
  'optionalModels/nucleus/Left-Lenticula.ply',
  'optionalModels/nucleus/Left-NAc.ply',
  'optionalModels/nucleus/Left-ALIC.ply',
  'optionalModels/nucleus/Right-Caudate.ply',
  'optionalModels/nucleus/Right-Lenticula.ply',
  'optionalModels/nucleus/Right-NAc.ply',
  'optionalModels/nucleus/Right-ALIC.ply',
]

const nucleusEnum = {
  GPi: {
    name: 'GPi',
    text: 'GPi（苍白球内侧）',
    color: 'rgba(239, 49, 28, 0.6)',
    visible: {
      left: true,
      right: true,
    },
  },
  MFB: {
    name: 'MFB',
    text: 'MFB（内侧前脑束）',
    color: 'rgba(244, 137, 31, 0.6)',
    visible: {
      left: true,
      right: true,
    },
  },
  ANT: {
    name: 'ANT',
    text: 'ANT（丘脑前核）',
    color: 'rgba(158, 17, 181, 0.6)',
    visible: {
      left: true,
      right: true,
    },
  },
  ACC: {
    name: 'ACC',
    text: 'ACC（前扣带回）',
    color: 'rgba(3, 199, 211, 0.6)',
    visible: {
      left: true,
      right: true,
    },
  },
  AMG: {
    name: 'AMG',
    text: 'AMG（杏仁核）',
    color: 'rgba(18, 155, 255, 0.6)',
    visible: {
      left: true,
      right: true,
    },
  },
  ALIC: {
    name: 'ALIC',
    text: 'ALIC（内囊前肢）',
    color: 'rgba(17, 181, 33, 0.6)',
    visible: {
      left: false,
      right: false,
    },
  },
  Caudate: {
    name: 'Caudate',
    text: 'Caudate（尾状体）',
    color: 'rgba(158, 17, 181, 0.6)',
    visible: {
      left: true,
      right: true,
    },
  },
  Lenticula: {
    name: 'Lenticula',
    text: 'Lenticula（晶状体）',
    color: 'rgba(239, 49, 28, 0.6)',
    visible: {
      left: true,
      right: true,
    },
  },
  NAc: {
    name: 'NAc',
    text: 'NAc（伏隔核）',
    color: 'rgba(18, 155, 255, 0.6)',
    visible: {
      left: true,
      right: true,
    },
  },
}

const nucleusMeshes = {}
const nucleusList = {}

const loadNucleus = async obj => {
  const { name, side, url } = obj
  const nucleausUrl = new URL(`../../../assets/${url}`, import.meta.url).href
  const geometry = await loadPLY(nucleausUrl)
  const { color, visible } = nucleusList[name]
  const { pureColor, alpha } = splitRGBA(color)
  const material = new THREE.MeshPhysicalMaterial({
    emissive: pureColor,
    transparent: true,
    opacity: alpha,
    depthTest: true,
    side: THREE.DoubleSide,
    roughness: 1,
    clearcoat: 0.1,
  })
  const mesh = new THREE.Mesh(geometry, material)
  // 性能提升重中之重，构建BVH树
  mesh.geometry.computeBoundsTree()
  mesh.rotation.x = Math.PI / -2
  mesh.rotation.z = Math.PI
  mesh.geometry.computeBoundingBox()
  mesh.updateWorldMatrix(true, true)
  mesh.geometry.boundingBox.applyMatrix4(mesh.matrixWorld)
  mesh.visible = visible[side]
  return mesh
}

const splitRGBA = color => {
  // 提取单纯的RGB和Alpha
  // 因为emissive不支持alpha，需要设置opacity
  const numReg = /\d+/g
  const arr = color.match(numReg)
  let R, G, B
  R = arr[0]
  G = arr[1]
  B = arr[2]
  const alpha = arr[4] ? `${arr[3]}.${arr[4]}` : `${arr[3]}`
  return { pureColor: `rgb(${R},${G},${B})`, alpha }
}

const createModel = mesh => {
  return {
    mesh: mesh,
    crossedFibers: [],
    startFromFibers: [],
    endWithFibers: [],
  }
}

/**将URL拆分成`name`和`url` */
const handleNucleusStep_1 = (urlList = []) => {
  return urlList.map(url => {
    // 取最后的名称
    const strs_1 = url.split('/')
    const target = strs_1.pop()
    // 去除后缀
    const strs_2 = target.split('.')[0]
    // 区分左右
    const [side, name] = strs_2.split('-')
    return { name, side: side.toLowerCase(), url }
  })
}

/**设置在Enum里命中的核团，并且在meshes里开辟空间 */
const handleNucleusStep_2 = (nucleusStep1List = []) => {
  const keys = Object.keys(nucleusEnum)
  nucleusStep1List.forEach(obj => {
    const { name } = obj
    // 直接判断在Enum里命中了哪些核团
    if (keys.includes(name)) {
      nucleusList[name] = nucleusEnum[name]
      nucleusMeshes[name] = { left: null, right: null }
    }
  })
}

/**加载Ply模型，并在meshes中设置 */
const handleNucleusStep_3 = (nucleusStep1List = []) => {
  return new Promise((resolve, reject) => {
    const requests = nucleusStep1List.map(obj => {
      return loadNucleus(obj)
    })
    Promise.all(requests)
      .then(arr => {
        arr.forEach((nucleusMesh, index) => {
          const obj = nucleusStep1List[index]
          const { name, side } = obj
          nucleusMeshes[name][side] = createModel(nucleusMesh)
        })
        resolve({ nucleusMeshes, nucleusList })
      })
      .catch(reject)
  })
}

export const changeNucleusColor = (...args) => {
  const [nucleus, color] = args
  const { name } = nucleus
  nucleusList[name].color = color
  const { left, right } = nucleusMeshes[name]
  const { pureColor, alpha } = splitRGBA(color)
  if (left && right) {
    left.mesh.material.emissive = new THREE.Color(pureColor)
    right.mesh.material.emissive = new THREE.Color(pureColor)
    left.mesh.material.opacity = alpha
    right.mesh.material.opacity = alpha
  }
}

export const changeNucleusVisible = (...args) => {
  const [nucleus, side] = args
  const { name } = nucleus
  nucleusList[name].visible = nucleus.visible
  const targetMesh = nucleusMeshes[name][side]
  if (targetMesh) {
    targetMesh.mesh.visible = nucleus.visible[side]
  }
}

export const useNucleus = () => {
  return new Promise((resolve, reject) => {
    const step1List = handleNucleusStep_1(urlList)
    handleNucleusStep_2(step1List)
    handleNucleusStep_3(step1List).then(resolve).catch(reject)
  })
}
