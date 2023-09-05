<script lang='ts' setup>
import { ref } from 'vue'

const hitokoto = ref('')
const hitokotoFrom = ref('')

getHitokoto()

// 获取一言
function getHitokoto() {
  fetch('https://v1.hitokoto.cn')
    .then(res => res.json())
    .then((res) => {
      hitokoto.value = res.hitokoto
      hitokotoFrom.value = res.from
    })
}
</script>

<template>
  <blur-bg v-if="hitokoto">
    <div>{{ hitokoto }}</div>
    <div v-if="hitokotoFrom" class="text-right mt-2">
      ———{{ hitokotoFrom }}
    </div>
  </blur-bg>
</template>

<style lang='scss' scoped>
</style>
