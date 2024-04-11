import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', {
  state: () => ({
    count: 0,
  }),
  getters: {
    doubleCount: state => state.count * 2,
  },
  actions: {
    // 因为我们依赖 `this`，所以我们不能使用箭头函数
    increment() {
      this.count++
    },
    async randomizeCounter() {
      setTimeout(() => {
        this.count = Math.round(100 * Math.random())
        return
      }, 2000)
    },
  },
})
