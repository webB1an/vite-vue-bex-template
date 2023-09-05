<script lang='ts' setup>
import { ref } from 'vue'

const weekMap = ['日', '一', '二', '三', '四', '五', '六']

const time = ref(new Date().toLocaleTimeString())
const year = ref(new Date().getFullYear())
const month = ref(new Date().getMonth() + 1)
const day = ref(new Date().getDate())
const week = ref(new Date().getDay())

setInterval(() => {
  time.value = new Date().toLocaleTimeString()
}, 1000)
</script>

<template>
  <div class="text-6xl text-[#fff] drop-shadow-md">
    <!-- <span class="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent"> -->
    <div class="">
      {{ time }}
    </div>
    <div class="text-lg">
      {{ year }}-{{ month }}-{{ day }} 周{{ weekMap[week] }}
    </div>
  </div>
</template>

<style lang='scss' scoped>
</style>
