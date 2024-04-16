import { loadFile } from '@/libs/loaders'
import { renderPole, renderCircleChips, renderElectric, updateChipMaterial } from '@/libs/renderLead'

import { leadParams } from '@/libs/leadParams'
let leads = {}
let leadConfig = []
let leadProgram = []

const leadUrl = '../../../assets/optionalModels/leads/lead.json'
const testPatientConfig = {
  leftChannel: {
    implantList: [
      {
        brain: 1,
        lead: 6,
        // 电极编号
        position: 2,
      },
    ],
  },
  rightChannel: {
    implantList: [
      {
        brain: 0,
        lead: 9,
        // 电极编号
        position: 1,
      },
    ],
  },
}
const testProgram = {
  leftChannel: [
    {
      nodes: [
        {
          index: 0,
          node: 1,
          color: '#845EC2',
          amplitude: 0,
          width: 0,
          rate: 0,
        },
        {
          index: 1,
          node: 1,
          color: '#F3C5FF',
          amplitude: 0,
          width: 0,
          rate: 0,
        },
        {
          index: 4,
          node: 0,
          color: '#00C9A7',
          amplitude: 0,
          width: 0,
          rate: 0,
        },
        {
          index: 5,
          node: 1,
          color: '#FEFEDF',
          amplitude: 0,
          width: 0,
          rate: 0,
        },
      ],
      display: 1,
      position: 2,
    },
  ],
  rightChannel: [
    {
      nodes: [
        {
          index: 2,
          node: 0,
          color: '',
          amplitude: 0,
          width: 0,
          rate: 0,
        },
        {
          index: 3,
          node: 0,
          color: '',
          amplitude: 0,
          width: 0,
          rate: 0,
        },
        {
          index: 6,
          node: 1,
          color: '#845EC2',
          amplitude: 0,
          width: 0,
          rate: 0,
        },
        {
          index: 7,
          node: 2,
          color: '#D65DB1',
          amplitude: 0,
          width: 0,
          rate: 0,
        },
        {
          index: 8,
          node: 0,
          color: '#FF6F91',
          amplitude: 0,
          width: 0,
          rate: 0,
        },
        {
          index: 9,
          node: 0,
          color: '#FF9671',
          amplitude: 0,
          width: 0,
          rate: 0,
        },
        {
          index: 10,
          node: 2,
          color: '#FFC75F',
          amplitude: 0,
          width: 0,
          rate: 0,
        },
        {
          index: 11,
          node: 0,
          color: '#F9F871',
          amplitude: 0,
          width: 0,
          rate: 0,
        },
      ],
      display: 1,
      position: 1,
    },
  ],
}

/**将PAD传递的参数转换为3D实际需要的参数 */
const adjustLeadConfig = patientConfig => {
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
  leadConfig = [...temp[0], ...temp[1]]
  console.log('载体传递的电极配置', leadConfig)
}

/**将channel的结构转换为扁平的数组结构 */
const adjustLeadProgram = programs => {
  leadProgram = []
  const { leftChannel, rightChannel } = programs
  leadProgram.push(...leftChannel, ...rightChannel)
  console.log('载体传递的程控程序', leadProgram)
}

// 读取json文件的坐标数组
const handleChipStep_1 = () => {
  leads = []
  const url = new URL(leadUrl, import.meta.url).href
  return new Promise((resolve, reject) => {
    loadFile(url)
      .then(data => {
        const obj = JSON.parse(data)
        const controlPoints = obj?.markups[0].controlPoints
        controlPoints.forEach(v => {
          const leadIndex = v.label.split('_')[0]
          const leadName = leadIndex
          if (!leads[leadName]) {
            const lead = {
              leadName,
              leadPoints: [],
              pole: null,
              chips: [],
            }
            leads[leadName] = lead
          }
          leads[leadName].leadPoints.push(v.position)
        })
        resolve()
      })
      .catch(reject)
  })
}

// 根据坐标绘制导线
const handleChipStep_2 = leads => {
  Object.values(leads).forEach(lead => {
    const pole = renderPole(lead)
    lead.pole = pole
  })
}

// 绘制电极片
const handleChipStep_3 = (patientConfig, programs) => {
  adjustLeadConfig(patientConfig)
  adjustLeadProgram(programs)
  // !不确定文件内电极的数量是否和载体传递的数量一致
  // !暂时以文件的电极为准
  Object.values(leads).forEach(lead => {
    const target = leadConfig.find(v => v.leadName === lead.leadName)
    // 根据target的position去找对应的程控程序
    const programs = leadProgram.find(v => v.position === target.position)
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
  updateChips(programs)
}

/**
 *
 * @param {string} leadType 电机型号
 * @param {object} initProgram 初始程控参数
 */
export const useChips = fileUrl => {
  return new Promise((resolve, reject) => {
    handleChipStep_1(fileUrl)
      .then(() => {
        console.log('文件加载的电极数据', leads)
        handleChipStep_2(leads)
        handleChipStep_3(testPatientConfig, testProgram)
        const leadList = Object.values(leads)
        resolve(leadList)
      })
      .catch(reject)
  })
}

const clearElectric = () => {
  // 先将所有的电场清除
  leads.forEach(v => {
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
export const updateChips = programs => {
  clearElectric()
  adjustLeadProgram(programs)
  leadProgram.forEach(v => {
    const { nodes, display, position } = v
    if (display === 1) {
      // 根据leadConfig寻找leadName
      const { leadName } = leadConfig.find(v => v.position === position)
      if (leadName) {
        // 根据leadName寻找正确的电极片
        const { chips } = leads.find(v => v.leadName === leadName)
        // 根据Nodes的配置更新电极片
        nodes.forEach(v => {
          const { index, node } = v
          // 根据Index寻找对应的电极片
          const targetChip = chips.find(v => v.index === index)
          updateChipMaterial(targetChip, v)
          if (node !== 0) {
            const electric = renderElectric(targetChip, v)
            targetChip.electric = electric
          }
        })
      }
    }
  })
}
