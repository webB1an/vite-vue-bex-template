<script lang='ts' setup>
import { nextTick, onMounted, reactive, ref, toRaw } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { cloneDeep } from 'lodash-es'
import { nanoid } from 'nanoid'
import defaultIcon from '../../assets/default-weather.png'
import type { IWebsite } from './types'
import { webList } from './web'
import Add from '~icons/gala/add'
import Delete from '~icons/material-symbols/delete-outline'

const website = ref<IWebsite[]>(webList)
const dialogVisible = ref(false)
const bookmarkFormRef = ref<FormInstance>()
const rules = reactive<FormRules>({
  name: [
    { required: true, message: '请输入名称', trigger: 'blur' },
  ],
  url: [
    { required: true, message: '请输入链接', trigger: 'blur' },
  ],
})
const bookmarkForm = ref<IWebsite>({
  id: '',
  name: '',
  url: '',
  icon: '',
})

const bookmarkStorageKey = 'one-tab-bex-365'

onMounted(async () => {
  const bookmarks = await getChromeStorageBookmark()
  if (bookmarks)
    website.value = JSON.parse(bookmarks) as IWebsite[]
})

// 从 chrome.storage.local 中获取书签
function getChromeStorageBookmark(): Promise<string> {
  return new Promise((resolve) => {
    chrome.storage.local.get(bookmarkStorageKey, (result) => {
      if (result[bookmarkStorageKey])
        resolve(result[bookmarkStorageKey])
      else
        resolve('')
    })
  })
}

// 将书签存入 chrome.storage.local
function setChromeStorageBookmark(bookmarks: string) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [bookmarkStorageKey]: bookmarks }, () => {
      resolve(true)
    })
  })
}

// 确认添加书签
async function confirmAddBookmark(formEl: FormInstance | undefined) {
  if (!formEl)
    return
  await formEl.validate((valid) => {
    if (valid) {
      if (!bookmarkForm.value.icon)
        bookmarkForm.value.icon = ''
      bookmarkForm.value.id = nanoid()
      website.value.push(cloneDeep(toRaw(bookmarkForm.value)))
      setChromeStorageBookmark(JSON.stringify(toRaw(website.value)))
      dialogVisible.value = false
      ElMessage({
        type: 'success',
        message: '添加成功！',
      })
    }
  })
}

// 确认删除书签
function deleteLocalBookmark(b: IWebsite) {
  ElMessageBox.confirm(
    '是否确认删除?',
    '提示',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
    },
  )
    .then(() => {
      const index = website.value.findIndex(c => c.id === b.id)
      website.value.splice(index, 1)
      setChromeStorageBookmark(JSON.stringify(toRaw(website.value)))
    })
}

// 打开添加书签弹窗
function openAddLocalBookmark() {
  dialogVisible.value = true
  bookmarkForm.value = {
    id: '',
    name: '',
    url: '',
    icon: '',
  }
  nextTick(() => {
    bookmarkFormRef.value?.clearValidate()
  })
}
</script>

<template>
  <div class="custom-website">
    <div class="flex items-center gap-2 text-2xl text-[#fff] drop-shadow-md">
      常用网站
      <el-tooltip content="添加常用网站" placement="top">
        <Add class="w-5 h-5 cursor-pointer" @click="openAddLocalBookmark" />
      </el-tooltip>
    </div>

    <div class="website-list grid grid-cols-8 gap-4">
      <a
        v-for="w in website"
        :key="w.id"
        :href="w.url"
        target="_self"
        class="flex flex-col justify-center items-center text-[#fff] drop-shadow-md cursor-pointer"
      >
        <div class="relative w-[60px] h-[60px] mt4 group">
          <img class="w-full h-full rounded-full" :src="w.icon || defaultIcon" alt="">
          <div v-if="!w.default" class="group-hover:flex hidden justify-center items-center absolute top-0 left-0 w-full h-full bg-[#fff]/30 backdrop-blur-md">
            <Delete class="w-[30px] h-[30px]" @click.stop.prevent="deleteLocalBookmark(w)" />
          </div>
        </div>
        <div class="truncate text-center">
          {{ w.name }}
        </div>
      </a>
    </div>
  </div>

  <el-dialog v-model="dialogVisible" width="500px" title="添加常用书签">
    <el-form ref="bookmarkFormRef" :model="bookmarkForm" :rules="rules" label-width="60px">
      <el-form-item label="名称" prop="name">
        <el-input v-model="bookmarkForm.name" />
      </el-form-item>
      <el-form-item label="网址" prop="url">
        <el-input v-model="bookmarkForm.url" />
      </el-form-item>
      <el-form-item label="图标">
        <el-input v-model="bookmarkForm.icon" />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmAddBookmark(bookmarkFormRef)">
          确认
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<style lang='scss' scoped>
</style>
