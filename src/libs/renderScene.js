import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import Stats from 'three/examples/jsm/libs/stats.module.js'
import { computeBoundsTree, disposeBoundsTree, acceleratedRaycast } from 'three-mesh-bvh'
import { loadOBJ, loadPLY } from '@/libs/loaders'

// 加速射线检测的重中之重
THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree
THREE.Mesh.prototype.raycast = acceleratedRaycast

const vertexShader = `
  varying vec3 vNormal;
  varying vec3 vPositionNormal;
  void main() 
  {
    vNormal = normalize( normalMatrix * normal ); // 转换到视图空间
    vPositionNormal = normalize(( modelViewMatrix * vec4(position, 1.0) ).xyz);
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
  }
`

const fragmentShader = `
  uniform vec3 glowColor;
  uniform float b;
  uniform float p;
  uniform float s;
  varying vec3 vNormal;
  varying vec3 vPositionNormal;
  void main() 
  {
    float a = pow( b + s * abs(dot(vNormal, vPositionNormal)), p );
    gl_FragColor = vec4( glowColor, a );
  }
`

const brainMaskMaterial = new THREE.ShaderMaterial({
  uniforms: {
    s: { type: 'f', value: -1.0 },
    b: { type: 'f', value: 0.8 },
    p: { type: 'f', value: 4.0 },
    glowColor: { type: 'c', value: new THREE.Color(0x00ffff) },
  },
  vertexShader: vertexShader,
  fragmentShader: fragmentShader,
  side: THREE.FrontSide,
  blending: THREE.AdditiveBlending,
  transparent: false,
})

export const loadBrainMask = async () => {
  const branMaskUrl = 'eddy_mask.ply'
  const branMask = await loadPLY(branMaskUrl)
  const mesh = new THREE.Mesh(branMask, brainMaskMaterial)
  mesh.rotation.x = Math.PI / -2
  mesh.rotation.z = Math.PI
  return mesh
}

const mainSceneDefaultConfig = {
  /**场景背景颜色 */
  backgroundColor: '#232A3B',
  /**相机可视距离 */
  cameraFar: 1000,
  /**镜头距离原点距离 */
  screenDistance: 80,
  /**显示帧数 */
  showFrameRate: false,
  /**显示坐标轴 */
  showAxes: true,
  /**全局光照强度 */
  lightStrength: 1,
}
const smallSceneDefaultConfig = {
  /**场景背景颜色 */
  backgroundColor: '#232A3B',
  /**相机可视距离 */
  cameraFar: 1000,
  /**镜头距离原点距离 */
  screenDistance: 3.5,
}

export const renderMainScene = (selector, config) => {
  let currentConfig,
    scene,
    camera,
    stats,
    axesHelper,
    renderer,
    controls,
    animId,
    renderWidth,
    renderHeight,
    dom,
    anim,
    destory
  const updateSize = () => {
    dom = document.querySelector(selector)
    if (dom instanceof HTMLDivElement) {
      renderWidth = dom.clientWidth
      renderHeight = dom.clientHeight
    } else {
      throw new Error(`${selector} i not correct selector`)
    }
  }
  currentConfig = Object.assign(mainSceneDefaultConfig, config)
  updateSize()
  // 场景
  scene = new THREE.Scene()
  scene.background = new THREE.Color(currentConfig.backgroundColor)
  // 相机
  camera = new THREE.PerspectiveCamera(75, renderWidth / renderHeight, 1, currentConfig.cameraFar)
  scene.add(camera)
  camera.lookAt(new THREE.Vector3(0, 0, 0))
  camera.position.set(0, 0, currentConfig.screenDistance)
  // renderer
  renderer = new THREE.WebGLRenderer({ logarithmicDepthBuffer: true, antialias: true, alpha: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(renderWidth, renderHeight)
  dom.appendChild(renderer.domElement)
  // 环境光+点光源
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.1)
  scene.add(ambientLight)
  const light1 = new THREE.DirectionalLight(0xffffff, currentConfig.lightStrength)
  light1.position.set(0, currentConfig.screenDistance, 0)
  const light2 = new THREE.DirectionalLight(0xffffff, currentConfig.lightStrength)
  light2.position.set(0, -currentConfig.screenDistance, 0)
  const light3 = new THREE.DirectionalLight(0xffffff, currentConfig.lightStrength)
  light1.position.set(0, 0, currentConfig.screenDistance)
  const light4 = new THREE.DirectionalLight(0xffffff, currentConfig.lightStrength)
  light2.position.set(0, 0, -currentConfig.screenDistance)
  scene.add(light1)
  scene.add(light2)
  scene.add(light3)
  scene.add(light4)
  // controls
  controls = new OrbitControls(camera, renderer.domElement)
  // 帧率调试
  if (currentConfig.showFrameRate) {
    stats = new Stats()
    document.body.appendChild(stats.dom)
  }
  // 坐标轴调试
  if (currentConfig.showAxes) {
    axesHelper = new THREE.AxesHelper(1000)
    scene.add(axesHelper)
  }
  // resize
  const onWindowResize = () => {
    updateSize()
    if (camera) {
      camera.aspect = renderWidth / renderHeight
      camera.updateProjectionMatrix()
      renderer.setSize(renderWidth, renderHeight)
    }
  }
  window.addEventListener('resize', onWindowResize)
  // anim
  anim = () => {
    animId = requestAnimationFrame(anim)
    controls.update()
    renderer.render(scene, camera)
    currentConfig.showFrameRate && stats.update()
  }
  // destory
  destory = () => {
    // 暂停渲染
    cancelAnimationFrame(animId)
    // 清空场景所有物体，释放资源
    scene.traverse(child => {
      if (child.material) {
        child.material.dispose()
      }
      if (child.geometry) {
        child.geometry.dispose()
      }
      child = null
    })
    scene.clear()
    scene = null
    // 清空render
    renderer.dispose()
    renderer.forceContextLoss()
    dom.removeChild(renderer.domElement)
    renderer.domElement = null
    renderer.content = null
    renderer = null
    // 清空其他项
    camera = null
    controls = null
    axesHelper = null
    stats = null
    console.log('主场景已清空')
  }
  const mainSceneManager = { scene, camera, renderer, controls, anim, destory, config: currentConfig }
  return mainSceneManager
}

export const renderSmallScene = selector => {
  let currentConfig, scene, camera, renderer, controls, animId, renderWidth, renderHeight, dom, anim, destory
  const updateSize = () => {
    dom = document.querySelector(selector)
    if (dom instanceof HTMLDivElement) {
      renderWidth = dom.clientWidth
      renderHeight = dom.clientHeight
    } else {
      throw new Error(`${selector} i not correct selector`)
    }
  }
  currentConfig = smallSceneDefaultConfig
  updateSize()
  // 场景
  scene = new THREE.Scene()
  // 相机
  camera = new THREE.PerspectiveCamera(75, renderWidth / renderHeight, 1, currentConfig.cameraFar)
  scene.add(camera)
  camera.lookAt(new THREE.Vector3(0, 0, 0))
  camera.position.set(0, 0, currentConfig.screenDistance)
  // renderer
  renderer = new THREE.WebGLRenderer({ logarithmicDepthBuffer: true, antialias: true, alpha: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(renderWidth, renderHeight)
  dom.appendChild(renderer.domElement)
  renderer.setClearAlpha(0)

  // 环境光+平行光，让phong材质呈石膏白色
  const ambientLight = new THREE.AmbientLight(0x7a7a7a, currentConfig.screenDistance)
  scene.add(ambientLight)
  const light = new THREE.DirectionalLight(0xcccccc, currentConfig.screenDistance)
  light.position.set(-currentConfig.screenDistance, currentConfig.screenDistance, currentConfig.screenDistance)
  scene.add(light)
  // resize
  const onWindowResize = () => {
    updateSize()
    if (camera) {
      camera.aspect = renderWidth / renderHeight
      camera.updateProjectionMatrix()
      renderer.setSize(renderWidth, renderHeight)
    }
  }
  window.addEventListener('resize', onWindowResize)
  // anim
  anim = () => {
    animId = requestAnimationFrame(anim)
    renderer.render(scene, camera)
  }
  // destory
  destory = () => {
    // 暂停渲染
    cancelAnimationFrame(animId)
    // 清空场景所有物体，释放资源
    scene.traverse(child => {
      if (child.material) {
        child.material.dispose()
      }
      if (child.geometry) {
        child.geometry.dispose()
      }
      child = null
    })
    scene.clear()
    scene = null
    // 清空render
    renderer.dispose()
    renderer.forceContextLoss()
    dom.removeChild(renderer.domElement)
    renderer.domElement = null
    renderer.content = null
    renderer = null
    // 清空其他项
    camera = null
    console.log('辅场景已清空')
  }
  const smallSceneManager = { scene, camera, renderer, controls, anim, destory, config: currentConfig }
  return smallSceneManager
}

export const renderSmallHead = async () => {
  const headUrl = 'head.obj'
  const headObj = await loadOBJ(headUrl)
  const material = new THREE.MeshLambertMaterial({ color: 0xffffff })
  const mesh = new THREE.Mesh(headObj, material)
  return mesh
}
