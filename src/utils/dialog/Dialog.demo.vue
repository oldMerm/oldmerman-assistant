<template>
  <button class="demo-btn" @click="dialogVisible = true">打开弹窗</button>

  <Dialog
    v-model:visible="dialogVisible"
    title="确认操作"
    content="确定要执行此操作吗？此操作无法撤销。"
    @confirm="onConfirm"
    @cancel="onCancel"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Dialog from './Dialog.vue';

const dialogVisible = ref(false);

const onConfirm = () => {
  console.log('用户点击了确定');
};

const onCancel = () => {
  console.log('用户点击了取消');
  dialogVisible.value = false;
};
</script>

<style scoped>
.demo-btn {
  padding: 10px 24px;
  background: #4A90D9;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.demo-btn:hover {
  background: #3a7fc8;
}
</style>