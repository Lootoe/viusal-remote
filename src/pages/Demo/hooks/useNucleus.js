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
    factor: 'GPi',
    text: 'GPi（苍白球内侧）',
    color: 'rgba(239, 49, 28, 0.6)',
    visible: {
      left: true,
      right: true,
    },
  },
  MFB: {
    factor: 'MFB',
    text: 'MFB（内侧前脑束）',
    color: 'rgba(244, 137, 31, 0.6)',
    visible: {
      left: true,
      right: true,
    },
  },
  ANT: {
    factor: 'ANT',
    text: 'ANT（丘脑前核）',
    color: 'rgba(158, 17, 181, 0.6)',
    visible: {
      left: true,
      right: true,
    },
  },
  ACC: {
    factor: 'ACC',
    text: 'ACC（前扣带回）',
    color: 'rgba(3, 199, 211, 0.6)',
    visible: {
      left: true,
      right: true,
    },
  },
  AMG: {
    factor: 'AMG',
    text: 'AMG（杏仁核）',
    color: 'rgba(18, 155, 255, 0.6)',
    visible: {
      left: true,
      right: true,
    },
  },
  ALIC: {
    factor: 'ALIC',
    text: 'ALIC（内囊前肢）',
    color: 'rgba(17, 181, 33, 0.6)',
    visible: {
      left: false,
      right: false,
    },
  },
  Caudate: {
    factor: 'Caudate',
    text: 'Caudate（尾状体）',
    color: 'rgba(158, 17, 181, 0.6)',
    visible: {
      left: true,
      right: true,
    },
  },
  Lenticula: {
    factor: 'Lenticula',
    text: 'Lenticula（晶状体）',
    color: 'rgba(239, 49, 28, 0.6)',
    visible: {
      left: true,
      right: true,
    },
  },
  NAc: {
    factor: 'NAc',
    text: 'NAc（伏隔核）',
    color: 'rgba(18, 155, 255, 0.6)',
    visible: {
      left: true,
      right: true,
    },
  },
}

const nucleusMeshes = []
const nucleusList = {}

const loadNucleus = async obj => {
  const { factor, url, side } = obj
  const nucleausUrl = new URL(`../../../assets/${url}`, import.meta.url).href
  const geometry = await loadPLY(nucleausUrl)
  const { color, visible } = nucleusList[factor]
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

/**将URL拆分成`name`和`url` */
const handleNucleusStep_1 = (urlList = []) => {
  return urlList.map(url => {
    // 取最后的名称
    const strs_1 = url.split('/')
    const target = strs_1.pop()
    // 去除后缀
    // name是从文件里解析的原始昵称，是神经纤维追踪所需的昵称
    const name = target.split('.')[0]
    // 区分左右
    // factor是和图案显示所需要的文案
    const [side, factor] = name.split('-')
    return { name, factor, url, side: side.toLowerCase() }
  })
}

/**设置在Enum里命中的核团，并且在meshes里开辟空间 */
const handleNucleusStep_2 = (nucleusStep1List = []) => {
  const keys = Object.keys(nucleusEnum)
  nucleusStep1List.forEach(obj => {
    const { factor, name, side } = obj
    // 直接判断在Enum里命中了哪些核团
    if (keys.includes(factor)) {
      const source = nucleusEnum[factor]
      nucleusList[factor] = source
      const model = {
        name: name,
        factor: factor,
        text: source.text,
        side: side,
        mesh: null,
        crossedFibers: [],
        startFromFibers: [],
        endWithFibers: [],
      }
      nucleusMeshes.push(model)
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
          nucleusMeshes[index].mesh = nucleusMesh
        })
        resolve({ nucleusMeshes, nucleusList })
      })
      .catch(reject)
  })
}

export const changeNucleusColor = (...args) => {
  const [nucleus, color] = args
  nucleusList[nucleus.factor].color = color
  const targets = nucleusMeshes.filter(v => v.factor === nucleus.factor)
  targets.forEach(v => {
    const { pureColor, alpha } = splitRGBA(color)
    v.mesh.material.emissive = new THREE.Color(pureColor)
    v.mesh.material.opacity = alpha
  })
}

export const changeNucleusVisible = (...args) => {
  const [nucleus, side] = args
  nucleusList[nucleus.factor].visible = nucleus.visible
  const targetMesh = nucleusMeshes.find(v => v.factor === nucleus.factor)
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
