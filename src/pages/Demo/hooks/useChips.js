import { loadFile } from '@/libs/loaders'
import { renderPole } from '@/libs/renderLead'

let leads = {}
const leadUrl = '../../../assets/optionalModels/leads/lead.json'

const createLead = leadName => {
  const lead = {
    leadName,
    leadType: '',
    leadPoints: [],
    mesh: null,
    chips: [],
  }
  leads[leadName] = lead
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
          const leadName = 'lead-' + leadIndex
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
    const mesh = renderPole(lead)
    lead.mesh = mesh
  })
}

// 绘制电极片
const handleChipStep_3 = () => {}

/**
 *
 * @param {string} leadType 电机型号
 * @param {object} initProgram 初始程控参数
 */
export const useChips = (fileUrl, leadType, initProgram) => {
  return new Promise((resolve, reject) => {
    handleChipStep_1(fileUrl)
      .then(() => {
        console.log('加载完成的电极数据', leads)
        handleChipStep_2(leads)
        resolve(leads)
      })
      .catch(reject)
  })
}
