<script setup lang="ts">
import { ref, computed } from 'vue';
import { RouterLink, RouterView } from 'vue-router';
import { type UserSettingParam, UserStatus } from '@/model/user';
import { httpInstance, type Response } from '@/utils/http';
import Toast from '@/utils/toast/Toast.vue';

const navItems = ref([
  { label: '主页', href: '/' },
  { label: '文档', href: 'https://oldmerman.cn' },
])

const sidebarItems = ref([
  { label: '用量统计', path: '/dashboard/usage' },
  { label: '模型注册', path: '/dashboard/model' },
  { label: '知识库管理', path: '/dashboard/vector' },
  { label: '文档管理', path: '/dashboard/document' },
])
// 初始化setting
const showSettings = ref(false)
// 弹框初始化
const toastRef = ref()
const msg = ref('')
const type = ref<'success' | 'error'>('success')


const userSetting = ref<UserSettingParam>({
  user_uuid: 'user-123456',
  username: '张三',
  email: 'zhangsan@example.com',
  phone: '13800138000',
  status: 0
})

const statusText = computed(() => UserStatus.get(userSetting.value.status) || '未知')

const openSettings = async () => {
  try {
    const res = await httpInstance.get<any, Response>("/user/setting")
    if (res.code !== 200) {
      type.value = 'error'
      msg.value = `${res.message}!`
      toastRef.value.show()
    } else {
      userSetting.value = res.data
    }
  } catch (error) {
    type.value = 'error'
    msg.value = `意外错误:${error}!`
    toastRef.value.show()
  }
  showSettings.value = true
}

const closeSettings = () => {
  showSettings.value = false
}

const saveSettings = async () => {
  try {
    const newUsername = userSetting.value.username
    if (newUsername === null || newUsername === '' || newUsername.length > 50) {
      type.value = 'error'
      msg.value = '用户名需要在1~50个字符之间!'
      toastRef.value.show()
      return
    }

    const res = await httpInstance.post<any, Response>("/user/setting", userSetting.value)
    if (res.code !== 200) {
      type.value = 'error'
      msg.value = `${res.message}!` || '未知错误!'
    } else {
      type.value = 'success'
      msg.value = '用户信息更新成功!'
    }
  } catch (error) {
    type.value = 'error'
    msg.value = `意外错误:${error}!`
  } finally {
    toastRef.value.show()
  }
  showSettings.value = false
}
</script>

<template>
  <div class="home-page">
    <Toast ref="toastRef" :message="msg" :type="type" :duration="1500" />

    <header class="topbar">
      <div class="topbar-content">
        <div class="logo">知识库管理系统</div>
        <nav class="nav-links">
          <a v-for="item in navItems" :key="item.label" :href="item.href" class="nav-link">
            {{ item.label }}
          </a>
          <a href="#" @click="openSettings" class="nav-link">设置</a>
        </nav>
      </div>
    </header>

    <div class="dashboard-layout">
      <aside class="sidebar">
        <nav class="sidebar-nav">
          <RouterLink
            v-for="item in sidebarItems"
            :key="item.path"
            :to="item.path"
            class="sidebar-link"
          >
            {{ item.label }}
          </RouterLink>
        </nav>
      </aside>
      <main class="dashboard-content">
        <RouterView />
      </main>
    </div>

    <div v-if="showSettings" class="modal-overlay">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>用户设置</h2>
          <button class="close-btn" @click="closeSettings">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>用户ID</label>
            <input v-model="userSetting.user_uuid" type="text" readonly />
          </div>
          <div class="form-row">
            <div class="form-group form-group-inline username">
              <label>用户名</label>
              <input v-model="userSetting.username" type="text" />
            </div>
            <div class="form-group form-group-inline status">
              <label>状态</label>
              <input :value="statusText" type="text" readonly />
            </div>
          </div>
          <div class="form-group">
            <label>邮箱</label>
            <input v-model="userSetting.email" type="text" readonly />
          </div>
          <div class="form-group">
            <label>手机号</label>
            <input v-model="userSetting.phone" type="text" readonly />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="closeSettings">取消</button>
          <button class="btn-save" @click="saveSettings">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url("/src/style/o-topbar1.css");

.topbar {
  position: sticky;
  top: 0;
  z-index: 100;
}

.home-page {
  width: 100%;
  height: 100vh;
  background: linear-gradient(135deg, #e8f4fc 0%, #d4ecf7 50%, #f0f7fc 100%);
  position: relative;
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.home-page::-webkit-scrollbar {
  display: none;
}

.dashboard-layout {
  display: flex;
  min-height: calc(100vh - 70px);
}

.sidebar {
  width: 200px;
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(10px);
  border-right: 1px solid rgba(59, 130, 246, 0.08);
  flex-shrink: 0;
  position: sticky;
  top: 0;
  align-self: flex-start;
  padding: 16px 0;
  min-height: calc(100vh - 70px);
  box-shadow: 1px 0 12px rgba(0,0,0,0.03);
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 0 10px;
}

.sidebar-link {
  display: flex;
  align-items: center;
  padding: 11px 16px 11px 24px;
  color: #64748b;
  text-decoration: none;
  font-size: 15px;
  font-weight: 500;
  border-radius: 8px;
  transition: background 0.2s ease, color 0.2s ease;
  position: relative;
}

.sidebar-link:hover {
  background: rgba(59, 130, 246, 0.06);
  color: #2563eb;
}

.sidebar-link.router-link-active {
  background: rgba(59, 130, 246, 0.1);
  color: #2563eb;
}

.dashboard-content {
  flex: 1;
  padding: 12px;
  background: linear-gradient(135deg, #e8f4fc 0%, #d4ecf7 50%, #f0f7fc 100%);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}

.modal-content {
  background: #f8f9fa;
  border-radius: 12px;
  width: 420px;
  max-width: 90%;
  box-shadow:
    0 10px 40px rgba(0, 0, 0, 0.15),
    0 2px 10px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  border: 1px solid #e0e0e0;
  animation: scaleIn 0.2s ease-out;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 24px;
  border-bottom: 1px solid #e0e0e0;
  background: linear-gradient(to bottom, #ffffff, #f5f5f5);
  border-radius: 12px 12px 0 0;
}

.modal-header h2 {
  margin: 0;
  font-size: 18px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  padding: 0;
  line-height: 1;
}

.close-btn:hover {
  color: #333;
}

.modal-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 16px;
}

.form-row {
  display: flex;
  gap: 16px;
}

.form-group-inline.username {
  flex: 2;
}

.form-group-inline.status {
  flex: 1;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #d0d0d0;
  border-radius: 6px;
  font-size: 14px;
  box-sizing: border-box;
  background: #fff;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.08);
  transition: all 0.2s ease;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #4a90d9;
  box-shadow:
    inset 0 1px 3px rgba(0, 0, 0, 0.08),
    0 0 0 3px rgba(74, 144, 217, 0.15);
}

.form-group input[readonly] {
  background: #e9e9e9;
  color: #666;
  cursor: not-allowed;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #e0e0e0;
  background: linear-gradient(to bottom, #f5f5f5, #ececec);
  border-radius: 0 0 12px 12px;
}

.btn-cancel,
.btn-save {
  padding: 8px 20px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
}

.btn-cancel {
  background: #fff;
  border: 1px solid #ddd;
  color: #333;
}

.btn-cancel:hover {
  background: #f5f5f5;
}

.btn-save {
  background: #4a90d9;
  border: none;
  color: #fff;
}

.btn-save:hover {
  background: #3a7bc8;
}
</style>