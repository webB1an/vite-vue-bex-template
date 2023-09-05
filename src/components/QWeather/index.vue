<script lang='ts' setup>
import { onMounted, ref, unref, watch } from 'vue'
import { useWeather } from '../../utils/weather'
import { getWeekday } from './types'

import type { Daily, Location, WeekDay } from './types'

import Setting from '~icons/material-symbols/settings'
import LocationFilled from '~icons/carbon/location-filled'

const weather = ref<Daily[]>([])

const { city, getChromeStorageWeather, setChromeStorageLocation } = useWeather()

onMounted(async () => {
  const location = await getChromeStorageWeather()
  if (!location)
    await setChromeStorageLocation()
  else
    city.value = location
})

watch(city, async () => {
  const { id } = await getLocation(unref(city))
  weather.value = await getWeather(id)
})

// 根据城市名称获取城市ID
function getLocation(city: string): Promise<Location> {
  return new Promise((resolve) => {
    fetch(`https://geoapi.qweather.com/v2/city/lookup?location=${city}&key=d70573df2a8c41dc8ce8cfcbf11102b2`)
      .then(res => res.json())
      .then((res) => {
        if (res.location && res.location.length > 0)
          resolve(res.location[0] as unknown as Location)
        else
          resolve({ id: '101210101', name: '杭州', lat: '30.24603', lon: '120.21079' })
      })
  })
}

// 根据城市 ID 获取天气
function getWeather(location: string): Promise<Daily[]> {
  return new Promise((resolve) => {
    fetch(`https://devapi.qweather.com/v7/weather/7d?location=${location}&key=d70573df2a8c41dc8ce8cfcbf11102b2`)
      .then(res => res.json())
      .then((res) => {
        resolve(res.daily as Daily[])
      })
  })
}

// function getIcon(name: string) {
//   return new URL(`../../assets/weather/icons/${name}.svg`, import.meta.url).href
// }

function getCurrentDate() {
  const today = new Date()
  const year = today.getFullYear() // 获取年份
  const month = String(today.getMonth() + 1).padStart(2, '0') // 获取月份（+1是因为月份从0开始，padStart用于补零）
  const day = String(today.getDate()).padStart(2, '0') // 获取日期（padStart用于补零）

  // 格式化成YYYY-MM-DD
  const formattedDate = `${year}-${month}-${day}`

  return formattedDate
}

function getDay(date: string): string {
  const today = getCurrentDate()
  if (today === date)
    return '今天'

  const weekday = new Date(date).getDay() as unknown as WeekDay

  return getWeekday(weekday)
}
</script>

<template>
  <blur-bg v-if="weather.length > 0" class="relative flex justify-around items-center pt-10">
    <el-tooltip content="修改位置" placement="top">
      <Setting class="absolute top-0 right-0 m-2 cursor-pointer" @click="setChromeStorageLocation" />
    </el-tooltip>
    <div class="flex items-center absolute top-0 left-0 m-2 cursor-pointer">
      <LocationFilled class="inline-block" />
      {{ city }}
    </div>
    <div v-for="w in weather" :key="w.fxDate" class="text-base text-center">
      <div>{{ getDay(w.fxDate) }}</div>
      <div class="text-xs my-1">
        {{ w.tempMin }}° - {{ w.tempMax }}°
      </div>
      <div class="qweather mb-2" :class="`qi-${w.iconDay}`" />
      {{ w.textDay }}
    </div>
  </blur-bg>
</template>

<style>
@import url('./styles/qweather-icons');
@font-face {
  font-family: "qweather-icons";
  src: url("./styles/qweather-icons.ttf") format("truetype");
}
.qweather {
  font-family: 'qweather-icons';
  font-size: 26px;
}
</style>
