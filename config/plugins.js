import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'
import { viteSingleFile } from 'vite-plugin-singlefile'
import { deleteMediaDir } from './deleteOptionalModels.js'

const basePlugins = [
  vue(),
  AutoImport({
    imports: ['vue', 'vue-router', 'pinia', '@vueuse/core'],
    eslintrc: {
      enabled: true,
      filepath: './.eslintrc-auto-import.json',
      globalsPropValue: true,
    },
    resolvers: NaiveUiResolver(),
  }),
  Components({
    resolvers: NaiveUiResolver(),
  }),
]

export const getPlugins = (mode, platform) => {
  const plugins = basePlugins
  if (platform === 'pad') {
    // *朱海丰要求所有文件必须同一层级
    plugins.push(viteSingleFile())
  }
  if (platform !== 'demo') {
    // *只有demo端才会将模型打包进去预览
    plugins.push(deleteMediaDir())
  }
  return plugins
}
