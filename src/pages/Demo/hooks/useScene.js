import { renderMainScene, renderSmallScene, renderSmallHead } from '@/libs/renderScene'

/**根据主场景切换辅场景的摄像机 */
const changeHeadSide = info => {
  let { mainSceneManager, smallSceneManager } = info
  const mainCamera = mainSceneManager.camera
  const assistCamera = smallSceneManager.camera
  const assistScreenDistance = smallSceneManager.config.screenDistance
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

/** 同步主视图和辅视图的旋转 */
const syncSceneRotate = info => {
  let { mainSceneManager } = info
  // 根据摄像头旋转的角度，实时计算右上角人头的旋转
  mainSceneManager.controls.addEventListener('change', () => {
    changeHeadSide(info)
  })
}

export default () => {
  const info = {
    mainSceneManager: null,
    smallSceneManager: null,
  }

  const initScene = ({ mainSelector, smallSelector, config }) => {
    return new Promise((resolve, reject) => {
      try {
        info.mainSceneManager = renderMainScene(mainSelector, config)
        info.mainSceneManager.anim()
        info.smallSceneManager = renderSmallScene(smallSelector)
        info.smallSceneManager.anim()
        renderSmallHead().then(headMesh => {
          info.smallSceneManager.scene.add(headMesh)
        })
        // loadBrainMask().then(brainMask => {
        //   mainSceneManager.scene.add(brainMask)
        // })
        syncSceneRotate(info)
        resolve()
      } catch (error) {
        reject(error)
      }
    })
  }

  /**切换摄像机相对核团的面向 */
  const changeCameraSide = params => {
    let { mainSceneManager } = info
    const { vector, rotation } = params
    const { camera, controls, config } = mainSceneManager
    camera.position.set(
      vector[0] * config.screenDistance,
      vector[1] * config.screenDistance,
      vector[2] * config.screenDistance
    )
    // *修改camera的LookAt无用，因为camera被controls托管了，需要修改controls的target
    controls.target.x = rotation.x
    controls.target.y = rotation.y
    controls.target.z = rotation.z
  }

  const addMesh = mesh => {
    let { mainSceneManager } = info
    if (mesh) {
      mainSceneManager.scene.add(mesh)
    }
  }

  const addMeshes = meshArr => {
    meshArr.forEach(mesh => {
      addMesh(mesh)
    })
  }

  const destoryScene = () => {
    let { mainSceneManager, smallSceneManager } = info
    mainSceneManager.destory()
    smallSceneManager.destory()
    mainSceneManager = null
    smallSceneManager = null
  }

  return { initScene, changeCameraSide, addMeshes, addMesh, destoryScene }
}
