<script setup>
defineOptions({
  name: 'nucleusManager',
})
const props = defineProps({
  backgroundColor: {
    type: String,
    default: 'rgba(51, 61, 80, 1)',
  },
  nucleusList: {
    type: Object,
    required: true,
  },
})
const emits = defineEmits(['colorChanged', 'visibleChanged'])
const predifineColors = Object.values(props.nucleusList).map(v => v.color)
const changeNucleusColor = (item, color) => {
  emits('colorChanged', item, color)
}
const changeNucleusVisible = (item, side) => {
  item.visible[side] = !item.visible[side]
  emits('visibleChanged', item, side)
}
</script>

// !TODO:需要区分环境来判断使用什么颜色
<template>
  <div class="nucleus-manager" :style="{ backgroundColor: backgroundColor }">
    <div class="top">
      <div class="top__left">名称</div>
      <div class="top__right">
        <div class="label">L(左)</div>
        <div class="label">R(右)</div>
      </div>
    </div>
    <div class="main">
      <div class="item" v-for="(item, index) in nucleusList" :key="index">
        <div class="item__left">
          <div class="item-dot">
            <n-color-picker
              :swatches="predifineColors"
              :default-value="item.color"
              placement="bottom-end"
              @update:value="changeNucleusColor(item, $event)"
            />
          </div>
          <div class="item-text">{{ item.text }}</div>
        </div>
        <div class="item__right">
          <div class="right__visible" @click="changeNucleusVisible(item, 'left')">
            <img v-if="item.visible.left" src="@/assets/img/eye_open.png" class="item-eye" />
            <img v-else src="@/assets/img/eye_close.png" class="item-eye" />
          </div>
          <div class="right__visible" @click="changeNucleusVisible(item, 'right')">
            <img v-if="item.visible.right" src="@/assets/img/eye_open.png" class="item-eye" />
            <img v-else src="@/assets/img/eye_close.png" class="item-eye" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.nucleus-manager {
  font-size: 0.18rem;
  color: rgba(255, 255, 255, 0.85);
  user-select: none;
  border-radius: 0.08rem;
  :deep(.n-color-picker-trigger) {
    border: none;
    &__fill {
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
    }
    .n-color-picker-trigger__value {
      display: none;
    }
  }
  .item-eye {
    width: 0.16rem;
    height: 0.16rem;
    cursor: pointer;
  }
  .top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.14rem 0.18rem;
    &__right {
      display: flex;
      align-items: center;
      div {
        width: 0.5rem;
        display: flex;
        justify-content: center;
        align-items: center;
      }
    }
  }
  .main {
    display: flex;
    flex-direction: column;
    .item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.14rem 0.18rem;
      border-top: 0.01rem solid rgba(49, 55, 70, 1);
      &__left {
        margin-right: 0.2rem;
        display: flex;
        justify-content: center;
        align-items: center;
        .item-dot {
          width: 0.22rem;
          height: 0.22rem;
          border-radius: 0.04rem;
          margin-right: 0.1rem;
          cursor: pointer;
          overflow: hidden;
        }
      }
      &__right {
        display: flex;
        align-items: center;
        div {
          width: 0.5rem;
          display: flex;
          justify-content: center;
          align-items: center;
          img {
            width: 0.2rem;
            height: 0.2rem;
          }
        }
      }
    }
  }
}
</style>
