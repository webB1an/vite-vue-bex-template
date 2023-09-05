<script lang='ts' setup>
import { computed } from 'vue'

interface Props {
  drawer: boolean
}

const props = withDefaults(defineProps<Props>(), {
  drawer: true,
})

const emit = defineEmits<{ (e: 'update:drawer', value: boolean): void }>()

const drawer = computed({
  get: () => props.drawer,
  set: (val: boolean) => emit('update:drawer', val),
})
</script>

<template>
  <el-drawer v-model.sync="drawer" direction="rtl">
    <template #header>
      <h4>修改壁纸</h4>
    </template>
    <template #default>
      111
    </template>
  </el-drawer>
</template>

<style lang='scss' scoped>
</style>
