import { renderMainScene, renderSmallScene, renderSmallHead } from '@/libs/renderScene'

let mainSceneManager, smallSceneManager

/** 同步主视图和辅视图的旋转 */
export const syncSceneRotate = () => {
  // 根据摄像头旋转的角度，实时计算右上角人头的旋转
  mainSceneManager.controls.addEventListener('change', () => {
    changeHeadSide(mainSceneManager.camera, smallSceneManager.camera, smallSceneManager.config.screenDistance)
  })
}

/**根据主场景切换辅场景的摄像机 */
export const changeHeadSide = () => {
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

/**切换摄像机相对核团的面向 */
export const changeCameraSide = params => {
  const { vector, rotation } = params
  const { camera, controls, config } = mainSceneManager
  camera.position.set(
    vector[0] * config.screenDistance,
    vector[1] * config.screenDistance,
    vector[2] * config.screenDistance
  )
  // !修改camera的LookAt无用，因为camera被controls托管了，需要修改controls的target
  controls.target.x = rotation.x
  controls.target.y = rotation.y
  controls.target.z = rotation.z
}

export const addMesh = mesh => {
  mainSceneManager.scene.add(mesh)
}

export const addMeshes = meshArr => {
  meshArr.forEach(mesh => {
    mainSceneManager.scene.add(mesh)
  })
}

export const useScene = (mainSelector, smallSelector, config) => {
  return new Promise((resolve, reject) => {
    try {
      mainSceneManager = renderMainScene(mainSelector, config)
      mainSceneManager.anim()
      smallSceneManager = renderSmallScene(smallSelector)
      smallSceneManager.anim()
      renderSmallHead().then(headMesh => {
        smallSceneManager.scene.add(headMesh)
      })
      // loadBrainMask().then(brainMask => {
      //   mainSceneManager.scene.add(brainMask)
      // })
      syncSceneRotate()
      resolve()
    } catch (error) {
      reject(error)
    }
  })
}
