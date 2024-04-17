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

/**加载文件 */
export const loadFile = url => {
  return new Promise((resolve, reject) => {
    const fileloadr = new THREE.FileLoader()
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

/**加载仿射变换矩阵 */
export const loadAffine = url => {
  return new Promise((resolve, reject) => {
    loadFile(url)
      .then(data => {
        const reg = /\s/g
        const arr = data.split(reg)
        // 去除末尾的空字符串
        const m4 = new THREE.Matrix4()
        arr.pop()
        const matrix = arr.map(v => Number(v))
        m4.set(...matrix)
        resolve(m4)
      })
      .catch(reject)
  })
}

export const loadFiber = (url, affine) => {
  const fiberVectors = []
  return new Promise((resolve, reject) => {
    loadFile(url)
      .then(data => {
        // 拆分线
        const regExp = /\n/g
        const arr = data.split(regExp)
        arr.forEach(data => {
          // 每3个数字组成一个点的坐标
          const points = data.split(/\s/)
          let final = []
          for (let i = 0; i < points.length; i = i + 3) {
            final.push([points[i], points[i + 1], points[i + 2]])
          }
          // 除去末尾无效的点
          final.pop()
          // 转成v3
          let v3Arr = final.map(item => {
            return new THREE.Vector3(item[0], item[1], item[2])
          })
          final = []
          // 仿射变换
          const piovt = v3Arr.map(v => {
            const m4 = new THREE.Matrix4()
            m4.makeRotationX(Math.PI / -2)
            v.applyMatrix4(affine)
            v.applyMatrix4(m4)
            return v
          })
          v3Arr = []
          fiberVectors.push(piovt)
        })
        // 最后一个是空的，所以去掉
        fiberVectors.pop()
        resolve(fiberVectors)
      })
      .catch(reject)
  })
}
