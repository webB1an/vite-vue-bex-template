<script lang='ts' setup>
function getTodayWorkProgress() {
  const now = new Date()
  const workingTimeStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0, 0)
  const workProgress = (((now.getTime() - workingTimeStart.getTime()) / (9 * 60 * 60 * 1000)) * 100)
  return workProgress
}

function getWeekWorkProgress() {
  const now = new Date()
  const currentDay = now.getDay()
  const firstDayOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
  firstDayOfWeek.setDate(now.getDate() - currentDay)

  const weekStart = new Date(firstDayOfWeek.getTime() + 1000)

  return (((now.getTime() - weekStart.getTime()) / (5 * 24 * 60 * 60 * 1000)) * 100)
}

getWeekWorkProgress()

const workProgress = getTodayWorkProgress()
const weekProgress = getWeekWorkProgress()
</script>

<template>
  <blur-bg>
    <div class="time-progress-container">
      <div class="time-progress">
        <div class="text-base">
          本日还剩：{{ workProgress }}%
        </div>
        <div class="bg-fuchsia-50 h-3 mt-2 rounded-sm overflow-hidden">
          <div class="h-full bg-[#acd4f4]" :style="{ width: `${workProgress}%` }" />
        </div>
      </div>

      <div class="time-progress mt-3">
        <div class="text-base">
          本周还剩：{{ weekProgress }}%
        </div>
        <div class="bg-fuchsia-50 h-3 mt-2 rounded-sm overflow-hidden">
          <div class="h-full bg-[#acd4f4]" :style="{ width: `${weekProgress}%` }" />
        </div>
      </div>
    </div>
  </blur-bg>
</template>

<style lang='scss' scoped>
</style>
