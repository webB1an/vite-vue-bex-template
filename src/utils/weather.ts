import { ref } from 'vue'

export function useWeather() {
  const weatherStorageKey = 'one-tab-bex-weather-365'
  const city = ref('')

  function setChromeStorageLocation(): Promise<string> {
    return new Promise((resolve) => {
      ElMessageBox.prompt('输入天气地区', '提示', {
        confirmButtonText: '确认',
        // 不能为空
        inputPattern: /\S+/,
        inputValue: city.value,
        inputErrorMessage: '地区不能为空',
      })
        .then(({ value }) => {
          setChromeStorageWeather(value)
          city.value = value
          resolve(value)
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

  return { city, weatherStorageKey, setChromeStorageLocation, getChromeStorageWeather, setChromeStorageWeather }
}
