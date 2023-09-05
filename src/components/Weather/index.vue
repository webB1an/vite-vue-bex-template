<script lang='ts' setup>
import { computed, onMounted, ref, watch } from 'vue'
import defaultWeather from '../../assets/default-weather.png'
import Setting from '~icons/material-symbols/settings'

// 引入文件下所有图片
const images = import.meta.glob('../../assets/weather/*.png', { eager: true })

const city = ref('')
const adcode = ref('')
const weather = ref('')
const temperature = ref('')
const winddirection = ref('')
const windpower = ref('')
const humidity = ref('')

const weatherStorageKey = 'one-tab-bex-weather-365'

const weatherIcon = computed(() => {
  const icon = images[`../../assets/weather/${weather.value}.png`] as { default: string }
  return icon ? icon.default : defaultWeather
})

watch(city, () => {
  getWeather()
})

onMounted(async () => {
  const location = await getChromeStorageWeather()
  if (!location)
    await setLocation()
  else
    city.value = location
})

function setLocation(): Promise<string> {
  return new Promise((resolve) => {
    ElMessageBox.prompt('输入天气地区', '提示', {
      confirmButtonText: '确认',
      // 不能为空
      inputPattern: /\S+/,
      inputErrorMessage: '地区不能为空',
    })
      .then(({ value }) => {
        setChromeStorageWeather(value)
        city.value = value
        resolve(value)
      })
  })
}

async function getWeather() {
  const adcode = await getLocationAdcode()
  if (!adcode) {
    setLocation()
    return ElMessage.error('获取天气失败, 请重新设置地区！')
  }
  fetch(`https://restapi.amap.com/v3/weather/weatherInfo?key=f8c7258dc2494116126a3e2b96fea456&city=${adcode}`)
    .then(res => res.json())
    .then((res) => {
      if (res.status !== '1')
        return ElMessage.error('获取天气失败')
      weather.value = res.lives[0].weather
      temperature.value = res.lives[0].temperature
      winddirection.value = res.lives[0].winddirection
      windpower.value = res.lives[0].windpower
      humidity.value = res.lives[0].humidity
    })
}

function getLocationAdcode() {
  return new Promise((resolve) => {
    fetch(`https://restapi.amap.com/v3/geocode/geo?key=f8c7258dc2494116126a3e2b96fea456&address=${city.value}`)
      .then(res => res.json())
      .then((res) => {
        if (res.status === '1') {
          adcode.value = res.geocodes[0].adcode
          resolve(res.geocodes[0].adcode)
        }
        else {
          resolve('')
        }
      })
  })
}

// 从 chrome.storage.local 中获取书签
function getChromeStorageWeather(): Promise<string> {
  return new Promise((resolve) => {
    chrome.storage.local.get(weatherStorageKey, (result) => {
      if (result[weatherStorageKey])
        resolve(result[weatherStorageKey])
      else
        resolve('')
    })
  })
}

function setChromeStorageWeather(location: string) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [weatherStorageKey]: location }, () => {
      resolve(true)
    })
  })
}
</script>

<template>
  <blur-bg v-if="adcode" class="relative flex justify-around items-center">
    <el-tooltip content="修改位置" placement="top">
      <Setting class="absolute top-0 right-0 m-4 cursor-pointer" @click="setLocation" />
    </el-tooltip>
    <img class="w-16" :src="weatherIcon" alt="">
    <div class="">
      <div class="text-xl">
        {{ city }}
      </div>
      {{ weather }}
      <div>{{ winddirection }}风{{ windpower }}级</div>
    </div>
    <div>
      <div>
        <div>{{ temperature }}℃</div>
        <div>湿度{{ humidity }}</div>
      </div>
    </div>
  </blur-bg>
</template>

<style lang='scss' scoped>
</style>
