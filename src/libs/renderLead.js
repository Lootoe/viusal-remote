import * as THREE from 'three'

const poleMaterial = new THREE.MeshPhysicalMaterial({
  color: 0x999999,
  metalness: 0,
  roughness: 0.4,
  transmission: 0.2,
  blending: THREE.AdditiveBlending,
  side: THREE.DoubleSide,
  transparent: true,
})

/** 根据触点坐标，添加导线首末坐标 */
const adjustCurveMatrix = positions => {
  const curve = new THREE.CatmullRomCurve3(positions)
  const endPoint = curve.getPointAt(0)
  const tangent_1 = curve.getTangentAt(0)
  const BottomPoint = endPoint.clone().addScaledVector(tangent_1, -0.5)
  // 顶端坐标延长
  const startPoint = curve.getPointAt(1)
  const tangent_2 = curve.getTangentAt(1)
  const distance = BottomPoint.distanceTo(positions[1])
  const TopPoint = startPoint.clone().addScaledVector(tangent_2, distance)
  return [BottomPoint, TopPoint]
}

/**生成导线的主模型 */
const renderPoleTop = (positions, radius = 1.27 / 2) => {
  // 样条曲线
  const curve = new THREE.CatmullRomCurve3(positions)
  // 扫描形状
  const circle = new THREE.EllipseCurve(0, 0, radius, radius, 0, Math.PI * 2, true)
  const points = circle.getPoints(72)
  const shape = new THREE.Shape(points)
  // 扫描成型
  const geometry = new THREE.ExtrudeGeometry(shape, {
    extrudePath: curve,
    steps: 128,
  })
  const mesh = new THREE.Mesh(geometry, poleMaterial)
  return mesh
}

/**生成底部半球 */
const renderPoleBottom = (positions, radius = 1.27 / 2) => {
  const curve = new THREE.CatmullRomCurve3(positions)
  const startPoint = curve.getPointAt(0)
  const tangent = curve.getTangentAt(0)
  const endPoint = startPoint.clone().addScaledVector(tangent, -0.5)
  const ball = new THREE.SphereGeometry(radius, 32, 32, 0, Math.PI, 0, Math.PI)
  const mesh = new THREE.Mesh(ball, poleMaterial)
  mesh.position.x = startPoint.x
  mesh.position.y = startPoint.y
  mesh.position.z = startPoint.z
  mesh.lookAt(endPoint)
  return mesh
}

export const renderPole = lead => {
  // 将其转换为vector3
  const { leadPoints } = lead
  // 将其转换为vector3
  const vectors = Object.values(leadPoints).map(v => {
    const v3 = new THREE.Vector3(Number(v[0]), Number(v[1]), Number(v[2]))
    // 不能直接旋转，必须将原始的坐标旋转过来
    // 将所有的坐标都转动Math.PI / -2
    const m4 = new THREE.Matrix4()
    m4.makeRotationX(Math.PI / -2)
    v3.applyMatrix4(m4)
    return v3
  })
  const posiitons = adjustCurveMatrix(vectors)
  const poleTop = renderPoleTop(posiitons)
  const poleBottom = renderPoleBottom(posiitons)
  const group = new THREE.Group()
  group.add(poleTop)
  group.add(poleBottom)
  return group
}
