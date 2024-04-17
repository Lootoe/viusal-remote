import { renderFibers } from '@/libs/renderFiber'
import { getAssets } from '@/utils/tools'
const tempAffineUrl = getAssets('optionalModels/matrix/affine.txt')
const tempFiberUrls = [getAssets('optionalModels/fiber/Lead_l.txt'), getAssets('optionalModels/fiber/Lead_r.txt')]

let fiberPool = []

export const useFibers = () => {
  return new Promise((resolve, reject) => {
    fiberPool = []
    renderFibers(tempAffineUrl, tempFiberUrls)
      .then(data => {
        fiberPool = data
        resolve(fiberPool)
      })
      .catch(reject)
  })
}
