<script lang='ts' setup>
import { nextTick, onMounted, reactive, ref, toRaw } from 'vue'
import type { CascaderValue, FormInstance, FormRules } from 'element-plus'
import { cloneDeep } from 'lodash-es'
import { nanoid } from 'nanoid'
import type { BookmarkTreeNode } from '../../types'
import type { IWebsite } from './website'
import Folder from '~icons/material-symbols/folder'
import Link from '~icons/bx/link'
import Arrow from '~icons/uiw/right'
import Delete from '~icons/material-symbols/delete-outline'
import Add from '~icons/gala/add'
import Close from '~icons/carbon/close-filled'

interface Level {
  parentId: string
  label: string
}

const originBookmarks = ref<BookmarkTreeNode[]>([])
const bookmarks = ref<BookmarkTreeNode[]>([])
const level = ref<Level[]>([
  {
    parentId: '1',
    label: '书签栏',
  },
])

const cascader = ref([])

const cascaderProps = {
  value: 'url',
  label: 'title',
  children: 'children',
}

const website = ref([] as IWebsite[])
const bookmarkForm = ref<IWebsite>({
  id: '',
  name: '',
  url: '',
  icon: '',
})
const bookmarkFormRef = ref<FormInstance>()

const rules = reactive<FormRules>({
  name: [
    { required: true, message: '请输入名称', trigger: 'blur' },
  ],
  url: [
    { required: true, message: '请输入链接', trigger: 'blur' },
  ],
})
const dialogVisible = ref(false)

const bookmarkStorageKey = 'one-tab-bex-365'

onMounted(async () => {
  const bookmarks = await getChromeStorageBookmark()
  if (bookmarks)
    website.value = JSON.parse(bookmarks) as IWebsite[]
})

function getCascader(val: CascaderValue) {
  // 判断类型是数组
  if (!Array.isArray(val))
    return
  const url = val[val.length - 1]
  cascader.value = []
  window.open(url as string, '_self')
}

if (chrome?.bookmarks)
  chrome.bookmarks.getTree(getBookmarks)

// 获取书签
function getBookmarks(tree: BookmarkTreeNode[]) {
  let b: BookmarkTreeNode[] = []

  const recursiveBookmark = (tree: BookmarkTreeNode[]) => {
    tree.forEach((c) => {
      if (c.children?.length && c.title === '')
        recursiveBookmark(c.children)
      else
        b.push(c)
    })
  }

  recursiveBookmark(tree)
  b = b.filter(c => c.children?.length)
  originBookmarks.value = b[0].children as BookmarkTreeNode[]
  bookmarks.value = b[0].children as BookmarkTreeNode[]
}

function getBookmarkChildren(bookmark: BookmarkTreeNode) {
  if (bookmark.url)
    return window.open(bookmark.url, '_self')
  const { id } = bookmark
  chrome.bookmarks.getSubTree(id, (result) => {
    const bookmark = result[0]
    level.value.push({
      parentId: bookmark.id,
      label: bookmark.title,
    })
    bookmarks.value = bookmark.children as BookmarkTreeNode[]
  })
}

function gotoBookmark(l: Level) {
  chrome.bookmarks.getSubTree(l.parentId, (result) => {
    const bookmark = result[0]
    const index = level.value.findIndex(c => c.parentId === l.parentId)
    level.value.splice(index + 1)
    bookmarks.value = bookmark.children as BookmarkTreeNode[]
  })
}

function deleteBookmark(id: string) {
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
      chrome.bookmarks.remove(id, () => {
        const index = bookmarks.value.findIndex(c => c.id === id)
        bookmarks.value.splice(index, 1)
        ElMessage({
          type: 'success',
          message: '删除成功！',
        })
      })
    })
}

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

function setChromeStorageBookmark(bookmarks: string) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [bookmarkStorageKey]: bookmarks }, () => {
      resolve(true)
    })
  })
}

// chrome.storage.local.remove(bookmarkStorageKey)

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
  <div class="my-10">
    <el-cascader v-model="cascader" popper-class="cascader-poper" style="width: 100%" size="large" filterable placeholder="搜索或选择书签" :options="originBookmarks" :props="cascaderProps" @change="getCascader" />
  </div>
  <div class="common-bookmark">
    <div class="px-2 font-bold text-base mb-2">
      常用书签
    </div>
    <div class="grid grid-cols-2 gap-4 xl:grid-cols-12 lg:grid-cols-5 md:grid-cols-3 sm:grid-cols-2 mb-10">
      <a v-for="w in website" :key="w.url" class="group relative flex flex-col justify-around items-center w-[80px] h-[80px] hover:bg-[#f7f9fc] hover:text-[#5787f7] box-border" :href="w.url" target="_self">
        <img class="w-[32px] h-[32px]" :src="w.icon" alt="w.name">
        <div class="text-sm">{{ w.name }}</div>
        <Close class="absolute right-2 top-2 hidden w-[20px] h-[20px] group-hover:block" @click.stop.prevent="deleteLocalBookmark(w)" />
      </a>
      <div class="flex flex-col items-center justify-around w-[80px] h-[80px] hover:bg-[#f7f9fc] hover:text-[#5787f7] box-border cursor-pointer" @click="openAddLocalBookmark">
        <Add class="w-[32px] h-[32px]" />
        <div class="text-sm">
          添加
        </div>
      </div>
    </div>
  </div>

  <div class="bookmark-level flex items-center h-10 px-2 font-bold">
    <div
      v-for="(item, index) in level"
      :key="item.parentId"
      class="flex items-center text-base cursor-pointer"
    >
      <span class="hover:text-[#5787f7]" @click="gotoBookmark(item)">{{ item.label }}</span>
      <Arrow v-if="level.length > 1 && index + 1 !== level.length" class="mx-2 text-xs" />
    </div>
  </div>
  <div class="bookmark-list divide-y divide-slate-200">
    <div
      v-for="bookmark in bookmarks"
      :key="bookmark.id"
      class="relative flex items-center h-12 px-4 bg-#fff hover:bg-[#f7f9fc] hover:text-[#5787f7] text-sm cursor-pointer"
      @click="getBookmarkChildren(bookmark)"
    >
      <template v-if="bookmark.children && bookmark.children.length > 0">
        <Folder class="text-lg text-[#f9d262] mr-2" />{{ bookmark.title }}
      </template>
      <template v-else>
        <Link class=" text-lg text-[#5787f7] mr-2" />
        <div class="truncate max-w-[400px]">
          {{ bookmark.title }}
        </div>
        <Delete class="absolute right-4" @click.stop="deleteBookmark(bookmark.id)" />
      </template>
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

<style>
.cascader-poper .el-cascader-node__label {
  max-width: 400px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
