import * as THREE from 'three'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader'

/**加载obj模型，主要是辅视图的人头 */
export const loadOBJ = url => {
  return new Promise((resolve, reject) => {
    const loader = new OBJLoader()
    loader.load(
      url,
      function (object) {
        const geometry = object.children[0].geometry
        resolve(geometry)
      },
      function () {},
      function (err) {
        reject(err)
      }
    )
  })
}

/**加载ply模型，主要是主视图的核团 */
export const loadPLY = url => {
  return new Promise((resolve, reject) => {
    const loader = new PLYLoader()
    loader.load(
      url,
      geometry => {
        geometry.computeVertexNormals()
        resolve(geometry)
      },
      null,
      reject
    )
  })
}

const loadFile = url => {
  return new Promise((resolve, reject) => {
    const fileloadr = new THREE.FileLoader()
    THREE.Cache.enabled = true
    fileloadr.load(
      url,
      data => {
        resolve(data)
      },
      null,
      reject
    )
  })
}

export const loadLeadConfig = url => {
  return loadFile(url).then(data => {
    return data
  })
}
