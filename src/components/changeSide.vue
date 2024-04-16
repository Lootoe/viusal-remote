<script setup>
import { loadImg } from '@/utils/tools.js'

defineOptions({ name: 'changeSide' })

/** 六个面枚举 */
const FACES = {
  FRONT: {
    name: '正面',
    icon: loadImg('front.png'),
    vector: [0, 0, 1],
    rotation: {
      x: 0,
      y: 0,
      z: 0,
    },
  },
  BEHIND: {
    name: '背面',
    icon: loadImg('behind.png'),
    vector: [0, 0, -1],
    rotation: {
      x: 0,
      y: 0,
      z: 0,
    },
  },
  LEFT: {
    name: '左侧面',
    icon: loadImg('left.png'),
    vector: [1, 0, 0],
    rotation: {
      x: 0,
      y: 0,
      z: 0,
    },
  },
  RIGHT: {
    name: '右侧面',
    icon: loadImg('right.png'),
    vector: [-1, 0, 0],
    rotation: {
      x: 0,
      y: 0,
      z: 0,
    },
  },
  UP: {
    name: '顶面',
    icon: loadImg('top.png'),
    vector: [0, 1, 0],
    rotation: {
      x: 0,
      y: 0,
      z: Math.PI / 2,
    },
  },
  DOWN: {
    name: '底面',
    icon: loadImg('bottom.png'),
    vector: [0, -1, 0],
    rotation: {
      x: 0,
      y: 0,
      z: 0,
    },
  },
}

const emits = defineEmits(['changeSide'])

const changeSide = item => {
  emits('changeSide', item)
}
</script>

<template>
  <div class="change-side">
    <div class="face-list">
      <div class="face-item" v-for="(item, index) in FACES" :key="index" @click="changeSide(item)">
        <img class="face-img" :src="item.icon" />
        <div class="face-name">{{ item.name }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.change-side {
  .face-list {
    display: flex;
    align-items: center;
  }
  .face-item {
    background-color: rgba(51, 61, 80, 1);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin-left: 0.2rem;
    border-radius: 0.08rem;
    transition: all 0.3s;
    cursor: pointer;
    padding: 0.1rem 0.2rem;
    transition: all 0.3s;
    .face-img {
      width: 0.88rem;
      height: 0.88rem;
      margin-bottom: 0.1rem;
    }
    .face-name {
      font-size: 0.18rem;
      color: rgba(255, 255, 255, 0.85);
    }
  }
}
</style>
