<script lang='ts' setup>
import { ref } from 'vue'
import type { CascaderValue } from 'element-plus'
import type { BookmarkTreeNode } from '../../types'

const cascader = ref([])
const origin = ref<BookmarkTreeNode[]>([])
const bookmarks = ref<BookmarkTreeNode[]>([])

const cascaderProps = {
  value: 'url',
  label: 'title',
  children: 'children',
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
  origin.value = b[0].children as BookmarkTreeNode[]
  bookmarks.value = b[0].children as BookmarkTreeNode[]
}

function getCascader(val: CascaderValue) {
  // 判断类型是数组
  if (!Array.isArray(val))
    return
  const url = val[val.length - 1]
  window.open(url as string, '_self')
}
</script>

<template>
  <div class="search-container">
    <el-cascader
      v-model="cascader"
      class="cascader-input" popper-class="cascader-poper" style="width: 100%" filterable placeholder="搜索书签" :options="origin" :props="cascaderProps" @change="getCascader"
    />
  </div>
</template>

<style>
.cascader-poper .el-cascader-node__label {
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.cascader-input .el-input__inner {
  height: 40px;
  padding-left: 20px;
}
.cascader-input .el-input__wrapper {
  border-radius: 9999px;
}
</style>
