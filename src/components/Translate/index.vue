<script lang='ts' setup>
import { ref, unref } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { MD5 } from 'crypto-js'

const target = ref('')
const result = ref('')

const port = chrome.runtime.connect({ name: 'one-tab-bex-translate' })
// 接收来自background页面的消息
port.onMessage.addListener((msg) => {
  // eslint-disable-next-line no-console
  console.log('Received message from background:', msg)
})

// 向background页面发送消息
port.postMessage({ message: 'hello from newTab' })

const translate = useDebounceFn(() => {
  const appId = '20230501001662789'
  const key = 'jy3UUhE0w8sh2aOERyuI'
  const salt = (new Date()).getTime()
  const sign = MD5(appId + unref(target) + salt + key).toString()

  const p = `q=${encodeURIComponent(unref(target))}&from=zh&to=en&appid=${appId}&salt=${salt}&sign=${sign}`

  fetch(`http://api.fanyi.baidu.com/api/trans/vip/translate?${p}`, { method: 'GET' }).then((response) => {
    return response.json()
  }).then((json) => {
    result.value = json.trans_result[0].dst
  })
}, 500)
</script>

<template>
  <div class="flex gap-2">
    <el-input
      v-model="target"
      class=""
      :autosize="{ minRows: 4, maxRows: 8 }"
      type="textarea"
      placeholder="输入文字翻译"
      @keyup="translate"
    />

    <el-input
      v-if="result"
      v-model="result"
      class="textarea-translate"
      :autosize="{ minRows: 4, maxRows: 8 }"
      readonly
      type="textarea"
    />
  </div>
</template>

<style>
.textarea-translate .el-textarea__inner {
  height: 100% !important;
}
</style>
