<template>
  <Transition name="dialog-fade">
    <div v-if="localVisible" class="dialog-overlay" @click.self="handleCancel">
      <div class="dialog-container">
        <div class="dialog-header">
          <h3 class="dialog-title">{{ title }}</h3>
        </div>
        <div class="dialog-body">
          <p class="dialog-content" v-if="content">{{ content }}</p>
          <slot></slot>
        </div>
        <div class="dialog-footer">
          <button class="btn btn-cancel" @click="handleCancel" :disabled="confirmLoading">取消</button>
          <button class="btn btn-confirm" @click="handleConfirm" :disabled="confirmLoading">
            <span v-if="confirmLoading" class="loading-spinner"></span>
            <span v-else>确定</span>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

interface Props {
  title: string;
  content?: string;
  visible?: boolean;
  confirmLoading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  confirmLoading: false
});

const emit = defineEmits<{
  'update:visible': [value: boolean];
  confirm: [];
  cancel: [];
}>();

const localVisible = ref(props.visible);

watch(() => props.visible, (val) => {
  localVisible.value = val;
});

watch(localVisible, (val) => {
  emit('update:visible', val);
});

const show = () => {
  localVisible.value = true;
};

const hide = () => {
  localVisible.value = false;
};

const handleConfirm = () => {
  emit('confirm');
  hide();
};

const handleCancel = () => {
  emit('cancel');
  hide();
};

defineExpose({ show, hide });
</script>

<style scoped>
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(240, 245, 250, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9998;
}

.dialog-container {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(74, 144, 217, 0.15);
  min-width: 400px;
  max-width: 480px;
  overflow: hidden;
  border: 1px solid rgba(74, 144, 217, 0.1);
}

.dialog-header {
  padding: 20px 24px 12px;
  border-bottom: 1px solid rgba(74, 144, 217, 0.1);
}

.dialog-title {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  color: #1a1a2e;
}

.dialog-body {
  padding: 20px 24px;
}

.dialog-content {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: #4a5568;
}

.dialog-footer {
  padding: 16px 24px 20px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn {
  padding: 8px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.btn-cancel {
  background: #f1f5f9;
  color: #64748b;
}

.btn-cancel:hover {
  background: #e2e8f0;
  color: #475569;
}

.btn-confirm {
  background: #4A90D9;
  color: #ffffff;
}

.btn-confirm:hover {
  background: #3a7fc8;
  box-shadow: 0 2px 8px rgba(74, 144, 217, 0.3);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.dialog-fade-enter-active {
  animation: dialog-zoom-in 0.3s ease-out;
}

.dialog-fade-leave-active {
  animation: dialog-fade-out 0.2s ease-in;
}

.dialog-fade-enter-active .dialog-container {
  animation: dialog-scale-in 0.3s ease-out;
}

.dialog-fade-leave-active .dialog-container {
  animation: dialog-scale-out 0.2s ease-in;
}

@keyframes dialog-zoom-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes dialog-fade-out {
  from { opacity: 1; }
  to { opacity: 0; }
}

@keyframes dialog-scale-in {
  from {
    transform: scale(0.9);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes dialog-scale-out {
  from {
    transform: scale(1);
    opacity: 1;
  }
  to {
    transform: scale(0.9);
    opacity: 0;
  }
}
</style>