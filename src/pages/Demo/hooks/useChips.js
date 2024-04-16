import { loadFile } from '@/libs/loaders'
import { renderPole, renderCircleChips } from '@/libs/renderLead'
import { leadParams } from '@/libs/leadParams'
let leads = {}
const leadUrl = '../../../assets/optionalModels/leads/lead.json'
const testPatientConfig = {
  leftChannel: {
    implantList: [
      {
        brain: 0,
        // 电极型号，假设它是1242
        lead: 6,
        // 电极编号
        position: 1,
      },
      {
        brain: 1,
        // 电极型号，假设它是1242
        lead: 5,
        // 电极编号
        position: 3,
      },
    ],
  },
  rightChannel: {
    implantList: [
      {
        brain: 1,
        // 电极型号，假设它是SR1212
        lead: 9,
        // 电极编号
        position: 2,
      },
      {
        brain: 0,
        // 电极型号，假设它是SR1212
        lead: 14,
        // 电极编号
        position: 4,
      },
    ],
  },
}
// const testProgram = {
//   leftChannel: [
//     {
//       nodes: [
//         {
//           index: 0,
//           node: 0,
//           color: '',
//           amplitude: 0,
//           width: 0,
//           rate: 0,
//         },
//       ],
//       display: true,
//       position: 0,
//     },
//     {},
//   ],
//   rightChannel: [],
// }

const createLead = leadName => {
  const lead = {
    leadName,
    leadPoints: [],
    pole: null,
    chips: [],
  }
  leads[leadName] = lead
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
  return temp
}

// 读取json文件的坐标数组
const handleChipStep_1 = () => {
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
            createLead(leadName)
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
const handleChipStep_3 = patientConfig => {
  const correctpatientConfig = adjustLeadConfig(patientConfig)
  const leadConfig = [...correctpatientConfig[0], ...correctpatientConfig[1]]
  console.log('载体传递的电极配置', leadConfig)
  // !不确定文件内电极的数量是否和载体传递的数量一致
  // !暂时以文件的电极为准
  Object.values(leads).forEach(lead => {
    const target = leadConfig.find(v => v.leadName === lead.leadName)
    if (target) {
      const chips = renderCircleChips(lead.leadPoints, target.config, target.leadName)
      lead.chips = chips
    }
  })
}

/**
 *
 * @param {string} leadType 电机型号
 * @param {object} initProgram 初始程控参数
 */
export const useChips = (fileUrl, initProgram) => {
  return new Promise((resolve, reject) => {
    handleChipStep_1(fileUrl)
      .then(() => {
        console.log('文件加载的电极数据', leads)
        handleChipStep_2(leads)
        handleChipStep_3(testPatientConfig, leads)
        resolve(leads)
      })
      .catch(reject)
  })
}
