// vite.config.js
import fs from 'fs'
import path from 'path'

export const deleteMediaDir = () => {
  return {
    name: 'delete-media-dir',
    writeBundle() {
      const dir = path.resolve(__dirname, '../dist', 'optionalModels')
      fs.rmdirSync(dir, { recursive: true })
    },
  }
}
