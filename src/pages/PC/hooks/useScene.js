import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import Stats from 'three/examples/jsm/libs/stats.module.js'
import { computeBoundsTree, disposeBoundsTree, acceleratedRaycast } from 'three-mesh-bvh'
import { loadOBJ } from '@/utils/loaders'
import { onMounted, onBeforeUnmount } from 'vue'

// 加速射线检测的重中之重
THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree
THREE.Mesh.prototype.raycast = acceleratedRaycast

const loadHead = async () => {
  const headUrl = new URL('../../../assets/model/head.obj', import.meta.url).href
  const headObj = await loadOBJ(headUrl)
  const material = new THREE.MeshLambertMaterial({ color: 0xffffff })
  const mesh = new THREE.Mesh(headObj, material)
  return mesh
}

const mainSceneDefaultConfig = {
  /**场景背景颜色 */
  backgroundColor: 0x465265,
  /**相机可视距离 */
  cameraFar: 1000,
  /**镜头距离原点距离 */
  screenDistance: 80,
  /**显示帧数 */
  showFrameRate: false,
  /**显示坐标轴 */
  showAxes: false,
  /**全局光照强度 */
  lightStrength: 1,
}
const smallSceneDefaultConfig = {
  /**场景背景颜色 */
  backgroundColor: 0x465265,
  /**相机可视距离 */
  cameraFar: 1000,
  /**镜头距离原点距离 */
  screenDistance: 3.5,
}

const renderMainScene = (selector, config) => {
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
  const mainSceneManager = { scene, camera, renderer, controls, anim, destory }
  return mainSceneManager
}

const renderSmallScene = selector => {
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
  renderer.setClearAlpha(0)
  dom.appendChild(renderer.domElement)
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
  const smallSceneManager = { scene, camera, renderer, controls, anim, destory }
  return smallSceneManager
}

/** 同步主视图和辅视图的旋转 */
export const syncSceneRotate = (mainControls, mainCamera, assistCamera, assistScreenDistance) => {
  // 根据摄像头旋转的角度，实时计算右上角人头的旋转
  mainControls.addEventListener('change', () => {
    changeHeadSide(mainCamera, assistCamera, assistScreenDistance)
  })
}

/**根据主场景切换辅场景的摄像机 */
export const changeHeadSide = (mainCamera, assistCamera, assistScreenDistance) => {
  const rotation = mainCamera.rotation
  const position = mainCamera.position
  const positionNormal = position.clone().normalize().multiplyScalar(assistScreenDistance)
  assistCamera.rotation.z = rotation.z
  assistCamera.rotation.y = rotation.y
  assistCamera.rotation.x = rotation.x
  // !这里的同步存在小问题:主视图相机移动时，辅助视图相机也会移动，导致逃出俯视图UI框
  assistCamera.position.z = positionNormal.z
  assistCamera.position.y = positionNormal.y
  assistCamera.position.x = positionNormal.x
}

export default (mainSelector, smallSelector, config) => {
  return new Promise((resolve, reject) => {
    let mainSceneManager, smallSceneManager
    onBeforeUnmount(() => {
      mainSceneManager && mainSceneManager.destory()
    })
    onMounted(() => {
      try {
        mainSceneManager = renderMainScene(mainSelector, config)
        mainSceneManager.anim()
        smallSceneManager = renderSmallScene(smallSelector)
        smallSceneManager.anim()
        loadHead().then(headMesh => {
          smallSceneManager.scene.add(headMesh)
        })
        const { controls, camera } = mainSceneManager
        syncSceneRotate(controls, camera, smallSceneManager.camera, smallSceneDefaultConfig.screenDistance)
        resolve(mainSceneManager)
      } catch (error) {
        reject(error)
      }
    })
  })
}
