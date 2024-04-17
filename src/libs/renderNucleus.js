import * as THREE from 'three'
import { loadPLY } from '@/libs/loaders'

export const renderNucleus = async (url, color, alpha) => {
  const geometry = await loadPLY(url)
  const material = new THREE.MeshPhysicalMaterial({
    emissive: color,
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
  return mesh
}
