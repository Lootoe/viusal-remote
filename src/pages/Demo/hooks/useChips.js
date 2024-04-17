import { loadFile } from '@/libs/loaders'
import { renderPole, renderCircleChips, renderElectric, updateChipMaterial } from '@/libs/renderLead'
import { leadParams } from '@/libs/leadParams'

/**将PAD传递的参数转换为3D实际需要的参数 */
const adjustLeadConfig = (info, patientConfig) => {
  const temp = {
    // 左脑电极
    0: [],
    // 右脑电极
    1: [],
  }
  // 区分左右脑
  const { leftChannel, rightChannel } = patientConfig
  leftChannel.implantList.forEach(v => {
    temp[v.brain].push(v)
  })
  rightChannel.implantList.forEach(v => {
    temp[v.brain].push(v)
  })
  // 将左右脑的电极根据posiiton排序
  temp['0'].sort((a, b) => a.position - b.position)
  temp['1'].sort((a, b) => a.position - b.position)
  // 根据排序重新标号
  // 将lead的整数编号，替换为真正的config
  temp['0'].forEach((v, i) => {
    v.leadName = String(i)
    v.config = leadParams[v.lead]
  })
  const len = temp['0'].length
  temp['1'].forEach((v, i) => {
    v.leadName = String(i + len)
    v.config = leadParams[v.lead]
  })
  const result = [...temp[0], ...temp[1]]
  console.log('载体传递的电极配置', result)
  info.leadConfig = result
}

/**将channel的结构转换为扁平的数组结构 */
const adjustLeadProgram = (info, patientProgram) => {
  const arr = []
  const { leftChannel, rightChannel } = patientProgram
  arr.push(...leftChannel, ...rightChannel)
  console.log('载体传递的程控程序', arr)
  info.leadProgram = arr
}

// 读取电极的坐标数组
const handleChipStep_1 = (leadUrl, info) => {
  const { leads } = info
  return new Promise((resolve, reject) => {
    loadFile(leadUrl)
      .then(data => {
        const obj = JSON.parse(data)
        const controlPoints = obj?.markups[0].controlPoints
        controlPoints.forEach(v => {
          const leadIndex = v.label.split('_')[0]
          const leadName = leadIndex
          const target = leads.find(v => v.leadName === leadName)
          if (!target) {
            const lead = {
              leadName,
              leadPoints: [v.position],
              pole: null,
              chips: [],
            }
            leads.push(lead)
          } else {
            target.leadPoints.push(v.position)
          }
        })
        resolve()
      })
      .catch(reject)
  })
}

// 根据坐标绘制导线
const handleChipStep_2 = info => {
  const { leads } = info
  Object.values(leads).forEach(lead => {
    const pole = renderPole(lead)
    lead.pole = pole
  })
}

// 绘制电极片
const handleChipStep_3 = (info, patientProgram) => {
  const { leads, leadConfig } = info
  // !不确定文件内电极的数量是否和载体传递的数量一致
  // !暂时以文件的电极为准
  Object.values(leads).forEach(lead => {
    const target = leadConfig.find(v => v.leadName === lead.leadName)
    // 根据target的position去找对应的程控程序
    const programArr = []
    const { leftChannel, rightChannel } = patientProgram
    programArr.push(...leftChannel, ...rightChannel)
    const programs = programArr.find(v => v.position === target.position)
    if (target) {
      const chips = renderCircleChips(lead.leadPoints, target.config, programs)
      const arr = chips.map((v, index) => {
        const program = programs.nodes[index]
        const obj = {
          name: 'c_' + v.name,
          text: '触点' + v.name,
          mesh: v,
          index: program.index,
          status: 0,
          config: target.config,
          electric: null,
        }
        return obj
      })
      lead.chips = arr
    }
  })
}

export default () => {
  const info = {
    leads: [],
    leadConfig: [],
    leadProgram: [],
  }

  /**渲染电极片 */
  const initChips = ({ leadUrl, patientConfig, patientProgram }) => {
    adjustLeadConfig(info, patientConfig)
    return new Promise((resolve, reject) => {
      handleChipStep_1(leadUrl, info)
        .then(() => {
          handleChipStep_2(info)
          handleChipStep_3(info, patientProgram)
          updateChips(patientProgram)
          resolve(info.leads)
        })
        .catch(reject)
    })
  }

  const clearElectric = () => {
    // 先将所有的电场清除
    info.leads.forEach(v => {
      const { chips } = v
      chips.forEach(k => {
        if (k.material) {
          k.material.dispose()
        }
        if (k.geometry) {
          k.geometry.dispose()
        }
        k = null
      })
    })
  }

  /**根据Program更新电极片和电场的显示 */
  const updateChips = patientProgram => {
    clearElectric()
    adjustLeadProgram(info, patientProgram)
    info.leadProgram.forEach(v => {
      const { nodes, display, position } = v
      if (display === 1) {
        // 根据leadConfig寻找leadName
        const { leadName } = info.leadConfig.find(v => v.position === position)
        if (leadName) {
          // 根据leadName寻找正确的电极片
          const { chips } = info.leads.find(v => v.leadName === leadName)
          // 根据Nodes的配置更新电极片
          nodes.forEach(v => {
            const { index, node } = v
            // 根据Index寻找对应的电极片
            const targetChip = chips.find(v => v.index === index)
            updateChipMaterial(targetChip, v)
            const electric = renderElectric(targetChip, v)
            targetChip.electric = electric
            if (node === 0) {
              electric.visible = false
            }
          })
        }
      }
    })
  }

  return { initChips, updateChips }
}
