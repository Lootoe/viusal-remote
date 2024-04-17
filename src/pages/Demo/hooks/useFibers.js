import { renderFibers, traverseFibers } from '@/libs/renderFiber'
import { analyse } from '@/libs/traverseAnalyse'

export const useFibers = () => {
  let fiberPool = []
  let models = []

  /**加载所有的神经纤维，但不显示 */
  const loadFibers = (tempAffineUrl, tempFiberUrls) => {
    return new Promise((resolve, reject) => {
      renderFibers(tempAffineUrl, tempFiberUrls)
        .then(data => {
          fiberPool = data
          resolve()
        })
        .catch(reject)
    })
  }

  /**为普通的对象添加追踪需要的属性，并投放到models数组 */
  const addModel = obj => {
    const { name, mesh } = obj
    const model = {
      // 相交的纤维序号，存储的是纤维池的索引
      crossedFibers: [],
      // 哪些纤维的起点经过它，存储的是纤维池的索引
      startFromFibers: [],
      // 哪些纤维的终点经过它，存储的是纤维池的索引
      endWithFibers: [],
      name,
      mesh,
    }
    models.push(model)
  }

  const getAllFibers = () => {
    return fiberPool.map(v => {
      v.mesh.visible = false
      return v.mesh
    })
  }

  const initFibers = ({ affineUrl, fiberUrlList, traverseArr }) => {
    return new Promise((resolve, reject) => {
      loadFibers(affineUrl, fiberUrlList)
        .then(() => {
          traverseArr.forEach(v => {
            addModel(v)
          })
          traverseFibers(models, fiberPool)
          console.log('每个模型追踪的结果', models)
        })
        .then(resolve)
        .catch(reject)
    })
  }

  const hideAllFibers = () => {
    fiberPool.forEach(v => {
      v.mesh.visible = false
    })
  }

  const analyseTraverse = source => {
    hideAllFibers()
    const arr = analyse(source, models, fiberPool)
    arr.forEach(v => {
      fiberPool[v].mesh.visible = true
    })
  }

  return { initFibers, getAllFibers, hideAllFibers, analyseTraverse }
}
