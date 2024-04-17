import * as THREE from 'three'

/**将!\$\^表示的核团全都替换成变量表示 */
const compileStep_1 = (info, genId) => {
  const { dataMap, operateStack } = info
  const factorReg = /([\\^\\!]{1}[a-zA-Z\\-]+_*\d*)|([a-zA-Z\\-\\_]+_\d*[\\$]{1})/g
  const arr = info.operateStr.match(factorReg)
  if (arr) {
    arr.forEach(express => {
      // 判断是否已有计算完的数据，有就复制过来
      const values = Object.entries(dataMap)
      const item = values.find(v => v[1].name === express)
      const id = genId()
      info.operateStr = info.operateStr.replace(express, id)
      operateStack.push(express)
      if (item) {
        dataMap[id] = { name: express, crossedFibers: item[1].crossedFibers }
      } else {
        dataMap[id] = { name: express, crossedFibers: null }
      }
    })
  }
}

/** 从前往后两个两个地计算集合的交集并集 */
const compileStep_2 = (info, genId) => {
  const { dataMap, operateStack } = info
  const operateReg = /[\\&\\|]/g
  const operates = info.operateStr.match(operateReg)
  if (operates) {
    operates.forEach(opt => {
      const id = genId()
      // 因为源字符串不断变化，所以是需要重新计算的
      const arr = info.operateStr.split(operateReg)
      const express = arr[0] + opt + arr[1]
      info.operateStr = info.operateStr.replace(express, id)
      operateStack.push(express)
      dataMap[id] = { name: express, crossedFibers: null }
    })
  }
}

/**正式运算 */
const compileStep_3 = (info, fiberPool) => {
  const { dataMap, operateStack } = info
  const operatReg = /[\\^\\!\\$\\&\\|]/
  const factorReg = /[a-zA-Z\\_\\-]+\d*/g
  const values = Object.entries(dataMap)
  operateStack.forEach(express => {
    const opt = express.match(operatReg)[0]
    if (opt === '^') {
      const factor = express.match(factorReg)[0]
      const item = values.find(v => v[1].name === express)
      const final = dataMap[factor].startFromFibers
      dataMap[item[0]].crossedFibers = final || []
    }
    if (opt === '$') {
      const factor = express.match(factorReg)[0]
      const item = values.find(v => v[1].name === express)
      const final = dataMap[factor].endWithFibers
      dataMap[item[0]].crossedFibers = final || []
    }
    if (opt === '!') {
      const factor = express.match(factorReg)[0]
      const item = values.find(v => v[1].name === express)
      const src = dataMap[factor].crossedFibers
      const all = Object.keys(fiberPool).map(v => Number(v))
      const final = all.filter(v => !(src.indexOf(v) > -1))
      dataMap[item[0]].crossedFibers = final || []
    }
    if (opt === '|') {
      let factors = express.match(factorReg)
      const item = values.find(v => v[1].name === express)
      factors = factors.map(v => v.trim())
      const pre = dataMap[factors[0]].crossedFibers
      const post = dataMap[factors[1]].crossedFibers
      const final = pre.concat(post)
      dataMap[item[0]].crossedFibers = final || []
    }
    if (opt === '&') {
      let factors = express.match(factorReg)
      const item = values.find(v => v[1].name === express)
      factors = factors.map(v => v.trim())
      const pre = dataMap[factors[0]].crossedFibers
      const post = dataMap[factors[1]].crossedFibers
      const final = pre.filter(v => post.indexOf(v) > -1)
      dataMap[item[0]].crossedFibers = final || []
    }
  })
}

const createIdHandle = () => {
  let idx = 0
  return () => {
    idx++
    return `k${idx}`
  }
}

export const analyse = (source, models, fiberPool) => {
  const info = {
    dataMap: {},
    operateStr: source,
    operateStack: [],
  }
  let genId = createIdHandle()
  models.forEach(v => {
    info.dataMap[v.name] = v
  })
  compileStep_1(info, genId)
  compileStep_2(info, genId)
  compileStep_3(info, fiberPool)
  console.log('info', info)
  return info.dataMap[info.operateStr.trim()].crossedFibers
}

export const traverseFibers = (models, fiberPool) => {
  const intersectSuccess = (raycaster, mesh, point) => {
    const direction = new THREE.Vector3(0, -1, -1)
    raycaster.set(point, direction)
    const intersects = raycaster.intersectObject(mesh)
    const success = intersects.length && direction.dot(intersects[0].face.normal) > 0
    return success
  }
  return new Promise(resolve => {
    const raycaster = new THREE.Raycaster()
    raycaster.firstHitOnly = true
    models.forEach(model => {
      const { mesh, startFromFibers, crossedFibers, endWithFibers } = model
      /**电场可能为空，那些模型就不需要追踪 */
      if (mesh) {
        mesh.updateWorldMatrix(true, true)
        fiberPool.forEach((fiber, index) => {
          // 计算每个核团都有哪些神经纤维经过
          for (let i = 0; i < fiber.matrix.length; i++) {
            const point = fiber.matrix[i]
            if (intersectSuccess(raycaster, mesh, point)) {
              crossedFibers.push(index)
              break
            }
          }
          // 计算每个核团都包含了哪些纤维的起始点
          const pointStart = fiber.matrix[0]
          if (intersectSuccess(raycaster, mesh, pointStart)) {
            startFromFibers.push(index)
          }
          // 计算每个核团都包含了哪些纤维的结束点
          const pointEnd = fiber.matrix[fiber.matrix.length - 1]
          if (intersectSuccess(raycaster, mesh, pointEnd)) {
            endWithFibers.push(index)
          }
        })
      }
    })
    resolve()
  })
}
