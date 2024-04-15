import { renderMainScene, renderSmallScene, renderSmallHead } from '@/libs/renderScene'

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
      const { controls, camera } = mainSceneManager
      syncSceneRotate(controls, camera, smallSceneManager.camera, smallSceneManager.config.screenDistance)
      resolve(mainSceneManager)
    } catch (error) {
      reject(error)
    }
  })
}
