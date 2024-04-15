<script setup>
defineOptions({
  name: 'traverseManager',
})
const singleItem = ref(true)
const selecedItem = ref(true)
</script>

<template>
  <div class="traverse-manager">
    <div class="content-box">
      <div class="top">
        <div class="top__inner">
          <div class="section">
            <div class="section__title">核团</div>
            <div class="section__list">
              <div class="section__item" v-for="index in 8" :key="index">GPi（苍白球内侧）</div>
            </div>
          </div>
          <div class="section">
            <div class="section__title">电极</div>
            <div class="section__list">
              <div class="section__item active" v-for="index in 8" :key="index">触点1</div>
            </div>
          </div>
        </div>
      </div>
      <div class="bottom" :class="{ active: selecedItem }">
        <div class="bottom__left">
          <div class="btn">重选</div>
        </div>
        <div class="bottom__right">
          <template v-if="singleItem">
            <div class="btn">确定</div>
          </template>
          <template v-else>
            <div class="btn">交集</div>
            <div class="btn">并集</div>
          </template>
        </div>
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
          width: 4.2rem;
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
}
</style>
