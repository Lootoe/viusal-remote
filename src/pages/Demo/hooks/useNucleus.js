import * as THREE from 'three'
import { loadPLY } from '@/utils/loaders'

const nucleusConfigList = [
  {
    name: 'Left-Caudate',
    url: 'optionalModels/nucleus/Left-Caudate.ply',
    visible: true,
    color: 'rgba(255, 0, 0, 0.4)',
  },
  {
    name: 'Left-Lenticula',
    url: 'optionalModels/nucleus/Left-Lenticula.ply',
    visible: true,
    color: 'rgba(244, 137, 31, 0.4)',
  },
  { name: 'Left-NAc', url: 'optionalModels/nucleus/Left-NAc.ply', visible: true, color: 'rgb(158, 17, 181,0.4)' },
  {
    name: 'Right-Caudate',
    url: 'optionalModels/nucleus/Right-Caudate.ply',
    visible: true,
    color: 'rgb(3, 199, 211,0.4)',
  },
  {
    name: 'Right-Lenticula',
    url: 'optionalModels/nucleus/Right-Lenticula.ply',
    visible: true,
    color: 'rgb(18, 155, 255,0.4)',
  },
  { name: 'Right-NAc', url: 'optionalModels/nucleus/Right-NAc.ply', visible: true, color: 'rgb(17, 181, 33,0.4)' },
  { name: 'Left-ALIC', url: 'optionalModels/nucleus/Left-ALIC.ply', visible: false, color: 'rgb(97, 97, 97,0.4)' },
  { name: 'Right-ALIC', url: 'optionalModels/nucleus/Right-ALIC.ply', visible: false, color: 'rgb(97, 97, 97,0.4)' },
]

const loadNucleus = async nucleusConfig => {
  const nucleausUrl = new URL(`../../../assets/${nucleusConfig.url}`, import.meta.url).href
  const geometry = await loadPLY(nucleausUrl)
  return geometry
}

export const getColorWithoutAlpha = color => {
  // 提取单纯的RGB和Alpha
  // 因为emissive不支持alpha，需要设置opacity
  const numReg = /\d+/g
  const arr = color.match(numReg)
  let R, G, B
  R = arr[0]
  G = arr[1]
  B = arr[2]
  return `rgb(${R},${G},${B})`
}

const getNucleusMat = color => {
  return new THREE.MeshPhysicalMaterial({
    emissive: getColorWithoutAlpha(color),
    transparent: true,
    opacity: 0.4,
    depthTest: true,
    side: THREE.DoubleSide,
    roughness: 1,
    clearcoat: 0.1,
  })
}

export default () => {
  const nucleusList = []
  return new Promise((resolve, reject) => {
    const requests = nucleusConfigList.map(nucleusConfig => {
      return loadNucleus(nucleusConfig)
    })
    Promise.all(requests)
      .then(arr => {
        arr.forEach((geometry, index) => {
          const color = nucleusConfigList[index].color
          const mesh = new THREE.Mesh(geometry, getNucleusMat(color))
          // 性能提升重中之重，构建BVH树
          mesh.geometry.computeBoundsTree()
          mesh.rotation.x = Math.PI / -2
          mesh.rotation.z = Math.PI
          mesh.geometry.computeBoundingBox()
          mesh.updateWorldMatrix(true, true)
          mesh.geometry.boundingBox.applyMatrix4(mesh.matrixWorld)
          const obj = {
            crossFibers: [],
            startFromFibers: [],
            endWithFibers: [],
            mesh: mesh,
            name: nucleusConfigList[index].name,
          }
          nucleusList.push(obj)
        })
        resolve(nucleusList)
      })
      .catch(reject)
  })
}
