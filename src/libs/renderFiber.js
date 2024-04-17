import * as THREE from 'three'
import { Line2 } from 'three/examples/jsm/lines/Line2.js'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js'
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js'
import { loadAffine, loadFiber } from '@/libs/loaders'

const calcColors = curve => {
  const colors = []
  for (let i = 0; i < 32; i++) {
    const t = curve.getTangentAt(i / 31).normalize()
    const x = new THREE.Vector3(1, 0, 0)
    const y = new THREE.Vector3(0, 1, 0)
    const z = new THREE.Vector3(0, 0, 1)
    let xAngle = Math.abs(t.dot(x) / (t.length() * x.length()))
    let yAngle = Math.abs(t.dot(y) / (t.length() * y.length()))
    let zAngle = Math.abs(t.dot(z) / (t.length() * z.length()))
    colors.push(xAngle, zAngle, yAngle)
  }
  return colors
}

const renderFiber = vectors => {
  const curve = new THREE.CatmullRomCurve3(vectors)
  const points = []
  const colors = calcColors(curve)
  for (let i = 0; i < 32; i++) {
    points.push(curve.getPointAt(i / 31))
  }
  const geometry = new LineGeometry()
  const positions = []
  points.forEach(v => {
    positions.push(v.x, v.y, v.z)
  })
  geometry.setPositions(positions)
  geometry.setColors(colors)

  const matLine = new LineMaterial({
    linewidth: 0.001,
    vertexColors: true,
    dashed: false,
  })

  const line = new Line2(geometry, matLine)
  line.computeLineDistances()
  return line
}

export const renderFibers = (affineUrl, fiberUrlList) => {
  return new Promise((resolve, reject) => {
    loadAffine(affineUrl)
      .then(affine => {
        const handles = fiberUrlList.map(v => loadFiber(v, affine))
        const results = []
        Promise.all(handles)
          .then(arr => {
            arr.forEach(fibers => {
              fibers.forEach(v => {
                const fiber = renderFiber(v)
                fiber.visible = false
                results.push(fiber)
              })
            })
            resolve(results)
          })
          .catch(reject)
      })
      .catch(reject)
  })
}
