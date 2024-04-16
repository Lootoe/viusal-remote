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
  const BottomPoint = endPoint.clone()
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

/**渲染某根导线 */
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

/**生成发光Alpha贴图 */
const createEmissiveMap = (
  width = 400,
  height = 400,
  text = 'hello',
  fontSize = 80,
  bgColor = '#000000',
  textColor = '#ffffff'
) => {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = bgColor
  ctx.fillRect(0, 0, width, height)
  ctx.beginPath()
  ctx.translate(width / 2, height / 2)
  ctx.fillStyle = textColor
  const font = 'normal ' + fontSize + 'px' + ' sans-serif'
  ctx.font = font
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, 0, 0)
  return canvas
}

/**生成电极材质，带文字标注 */
const createChipMaterial = (width, height, text, fontSize) => {
  const texture = new THREE.CanvasTexture(createEmissiveMap(width, height, text, fontSize))
  return new THREE.MeshStandardMaterial({
    color: '#27386f',
    emissiveMap: texture,
    transparent: false,
    emissive: 0xffffff,
    side: THREE.DoubleSide,
    metalness: 0,
    roughness: 0.5,
  })
}

export const renderCircleChips = (points, chipConfig, program) => {
  // 将三维数组转换为vector3
  const vectors = points.map(v => {
    const v3 = new THREE.Vector3(Number(v[0]), Number(v[1]), Number(v[2]))
    // 不能直接旋转，必须将原始的坐标旋转过来
    // 将所有的坐标都转动Math.PI / -2
    const m4 = new THREE.Matrix4()
    m4.makeRotationX(Math.PI / -2)
    v3.applyMatrix4(m4)
    return v3
  })
  const curve = new THREE.CatmullRomCurve3(vectors)
  // 计算电极线的长度
  const poleLength = curve.getLength()
  let totalGap = 0
  const chipArr = chipConfig.gap.map((gap, index) => {
    totalGap += gap
    // 计算前面的间距总和
    // 电极片起始点的位置 = firstChipDistance + 电极片长度 * (index) + 电极片间距 * (index)
    const startPos = index * chipConfig.len + totalGap
    // 电极片结束点的位置 = 起始点的位置 + 电极片长度
    const endPos = startPos + chipConfig.len
    // 根据起始点百分比，获取点的位置，成线
    const startPoint = curve.getPointAt(startPos / poleLength)
    const endPoint = curve.getPointAt(endPos / poleLength)
    // 旋转成体
    const p1 = new THREE.Vector2(chipConfig.radius + 0.02, -chipConfig.len / 2)
    const p2 = new THREE.Vector2(chipConfig.radius + 0.02, chipConfig.len / 2)
    const geometry = new THREE.LatheGeometry([p1, p2], 36, 0, Math.PI * 2)
    // 性能提升重中之重，构建BVH树
    geometry.computeBoundsTree()
    // 计算包围盒，加速射线检测
    geometry.computeBoundingBox()
    // 为电极定义额外数据
    const { nodes } = program
    const num = nodes[index].index
    const extraData = {
      // 带电状态0(不带电),1(正电),2(负电)
      status: 0,
      name: num,
    }
    // mesh
    // 贴图的高度需要根据chipConfig来调整，防止文字被压扁
    const k = chipConfig.len / 3
    const mesh = new THREE.Mesh(geometry, createChipMaterial(400, 400 * k, num, 60))
    mesh.extraData = extraData
    mesh.updateWorldMatrix(true, true)
    // 给电极片定位
    const centerPoint = new THREE.Vector3().lerpVectors(startPoint, endPoint, 0.5)
    mesh.position.x = centerPoint.x
    mesh.position.y = centerPoint.y
    mesh.position.z = centerPoint.z
    // 矫正方向
    const direction = curve.getTangentAt(1)
    const quaternion = new THREE.Quaternion()
    quaternion.setFromUnitVectors(mesh.up, direction)
    mesh.quaternion.copy(quaternion)
    // 还要绕导线的方向旋转PI
    mesh.rotateOnWorldAxis(direction.normalize(), Math.PI)
    geometry.boundingBox.applyMatrix4(mesh.matrixWorld)
    return mesh
  })
  return chipArr
}
