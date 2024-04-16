<script setup>
import { watch } from 'vue'
defineOptions({
  name: 'traverseManager',
})
const props = defineProps({
  nucleusList: {
    type: Array,
    required: true,
  },
  leadList: {
    type: Array,
    required: true,
  },
})
const localNucleusList = ref([])
const localLeadList = ref([])
watch(
  () => props.nucleusList,
  newv => {
    const keys = Object.values(newv)
    const arr = []
    keys.forEach(v => {
      const prefix = v.side === 'left' ? 'L-' : 'R-'
      const obj = {
        name: v.name,
        factor: prefix + v.factor,
        text: prefix + v.text,
        selected: false,
      }
      arr.push(obj)
    })
    localNucleusList.value = arr
  },
  { immediate: true }
)
watch(
  () => props.leadList,
  newv => {
    const arr = []
    newv.forEach(v => {
      const { chips } = v
      arr.push(...chips)
    })
    arr.sort((a, b) => a.index - b.index)
    localLeadList.value = arr.map(v => {
      return {
        name: v.name,
        factor: v.name,
        text: v.text,
        selected: false,
      }
    })
  },
  { immediate: true }
)

// 是否单一选中项
const isSingle = ref(true)
// 是否有选中项
const hasSeleced = ref(false)

const selectItem = item => {
  item.selected = !item.selected
  // 判断有没有选中项
  const selectedArr_1 = localNucleusList.value.filter(v => v.selected)
  const selectedArr_2 = localLeadList.value.filter(v => v.selected)
  const selectedNum = selectedArr_1.length + selectedArr_2.length
  hasSeleced.value = selectedNum > 0
  isSingle.value = selectedNum <= 1
}
const resetAll = () => {
  localNucleusList.value.forEach(v => {
    v.selected = false
  })
  localLeadList.value.forEach(v => {
    v.selected = false
  })
  isSingle.value = true
  hasSeleced.value = false
}
</script>

<template>
  <div class="traverse-manager">
    <div class="content-box">
      <div class="top">
        <div class="top__inner">
          <div class="section">
            <div class="section__title">核团</div>
            <div class="section__list">
              <div
                class="section__item"
                v-for="(item, index) in localNucleusList"
                :key="index"
                :class="{ active: item.selected }"
                @click="selectItem(item)"
              >
                {{ item.text }}
              </div>
            </div>
          </div>
          <div class="section">
            <div class="section__title">电极</div>
            <div class="section__list">
              <div
                class="section__item"
                v-for="(item, index) in localLeadList"
                :key="index"
                :class="{ active: item.selected }"
                @click="selectItem(item)"
              >
                {{ item.text }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="bottom" :class="{ active: hasSeleced }">
        <div class="bottom__left">
          <div class="btn" @click="resetAll">重选</div>
        </div>
        <div class="bottom__right">
          <template v-if="isSingle">
            <div class="btn">确定</div>
          </template>
          <template v-else>
            <div class="btn">交集</div>
            <div class="btn">并集</div>
          </template>
        </div>
      </div>
    </div>
    <div class="btn-box"></div>
  </div>
</template>

<style scoped lang="less">
.traverse-manager {
  .content-box {
    background-color: rgba(51, 61, 80, 1);
    border: 0.01rem solid rgb(147, 153, 165);
    border-radius: 0.08rem;
    box-sizing: border-box;
    user-select: none;
    .top {
      padding: 0.04rem;
      .top__inner {
        height: 6rem;
        overflow-y: scroll;
        padding: 0.14rem;
        &::-webkit-scrollbar {
          width: 0.08rem;
        }

        &::-webkit-scrollbar-thumb {
          background-color: rgba(103, 110, 125, 1);
          border-radius: 100px;
        }
      }

      .section {
        margin-bottom: 0.25rem;
        .section__title {
          font-size: 0.26rem;
          color: rgba(164, 180, 213, 1);
          margin-bottom: 0.18rem;
        }
        .section__list {
          width: 4.6rem;
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          .section__item {
            cursor: pointer;
            width: 46%;
            display: flex;
            justify-content: center;
            padding: 0.18rem 0;
            font-size: 0.18rem;
            color: rgba(255, 255, 255, 1);
            border: 0.01rem dashed rgba(103, 110, 125, 1);
            border-radius: 0.04rem;
            margin-bottom: 0.12rem;
            transition: all 0.3s;
            &:hover {
              border: 0.01rem solid rgba(122, 192, 199, 1);
              background-color: rgba(122, 192, 199, 0.3);
            }
            &.active {
              border: 0.01rem solid rgba(122, 192, 199, 1);
              background-color: rgba(122, 192, 199, 0.3);
            }
          }
        }
      }
    }
    .bottom {
      color: rgba(255, 255, 255, 0.7);
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.18rem;
      padding: 0.18rem;
      border-top: 0.01rem solid rgba(103, 110, 125, 1);
      .bottom__left {
        .btn {
          cursor: pointer;
          height: 0.4rem;
          width: 1rem;
          border: 0.01rem solid rgba(103, 110, 125, 1);
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 0.18rem;
          border-radius: 0.06rem;
        }
      }
      .bottom__right {
        flex: 1;
        display: flex;
        justify-content: space-between;
        .btn {
          cursor: pointer;
          width: 100%;
          height: 0.4rem;
          background-color: rgba(122, 192, 199, 0.7);
          display: flex;
          justify-content: center;
          align-items: center;
          border-radius: 0.06rem;
          margin: 0 0.08rem;
        }
      }
      &.active {
        color: #fff;
        .bottom__right {
          .btn {
            background-color: rgba(122, 192, 199, 1);
            border: none;
          }
        }
      }
    }
  }
  .btn-box {
  }
}
</style>
