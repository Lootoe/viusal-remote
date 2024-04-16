<script setup>
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
const emits = defineEmits(['traverse', 'reset'])
const localNucleusList = shallowRef([])
const localLeadList = shallowRef([])
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
// 弹框是否收起
const showModal = ref(true)
// 是否展示重置按钮
const showReset = ref(false)
const selectItem = item => {
  item.selected = !item.selected
  // 判断有没有选中项
  const selectedArr_1 = localNucleusList.value.filter(v => v.selected)
  const selectedArr_2 = localLeadList.value.filter(v => v.selected)
  const selectedNum = selectedArr_1.length + selectedArr_2.length
  hasSeleced.value = selectedNum > 0
  isSingle.value = selectedNum <= 1
}
const reselect = () => {
  localNucleusList.value.forEach(v => {
    v.selected = false
  })
  localLeadList.value.forEach(v => {
    v.selected = false
  })
  isSingle.value = true
  hasSeleced.value = false
}
const traverse = type => {
  // 从列表里筛选出已选中的item
  const arr_1 = localLeadList.value.filter(v => v.selected).map(v => v.factor)
  const arr_2 = localNucleusList.value.filter(v => v.selected).map(v => v.factor)
  const arr = [...arr_1, ...arr_2]
  showModal.value = false
  showReset.value = true
  emits('traverse', type, arr)
}
const reset = () => {
  showReset.value = false
  emits('reset')
}
</script>

<template>
  <div class="traverse-manager">
    <div class="content-box" v-show="showModal">
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
          <div class="btn" @click="reselect">重选</div>
        </div>
        <div class="bottom__right">
          <template v-if="isSingle">
            <div class="btn" @click="traverse('confirm')">确定</div>
          </template>
          <template v-else>
            <div class="btn" @click="traverse('cross')">交集</div>
            <div class="btn" @click="traverse('append')">并集</div>
          </template>
        </div>
      </div>
    </div>
    <div class="btn-box">
      <div class="btn-toggle" @click="showModal = !showModal">
        <img src="@/assets/img/arrow.png" :class="{ down: !showModal }" />
        <div class="btn__text">神经纤维</div>
      </div>
      <div class="btn-reset" v-show="showReset" @click="reset">
        <img src="@/assets/img/reset.png" />
        <div class="btn__text">重置</div>
      </div>
    </div>
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
    margin-top: 0.2rem;
    display: flex;
    align-items: center;
    .btn-toggle {
      height: 0.6rem;
      padding: 0 0.2rem;
      border-radius: 0.08rem;
      color: rgba(113, 176, 184, 1);
      font-size: 0.22rem;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: rgba(51, 61, 80, 1);
      border: 0.01rem solid rgba(103, 110, 125, 1);
      cursor: pointer;
      user-select: none;
      margin-right: 0.22rem;
      box-sizing: border-box;
      img {
        width: 0.24rem;
        margin-right: 0.12rem;
        &.down {
          transform: rotateX(180deg) !important;
        }
      }
    }
    .btn-reset {
      height: 0.6rem;
      padding: 0 0.2rem;
      border-radius: 0.08rem;
      color: #fff;
      font-size: 0.22rem;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: rgba(122, 192, 199, 1);
      cursor: pointer;
      user-select: none;
      img {
        width: 0.3rem;
        margin-right: 0.12rem;
      }
    }
  }
}
</style>
