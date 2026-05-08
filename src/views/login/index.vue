<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getHome } from '@/utils/commonUtils'
import { httpInstance, type Response } from '@/utils/http'

const router = useRouter()

const isRegister = ref(false)
const form = ref({
  username: '',
  password: '',
  confirmPassword: '',
  secretKey: ''
})

const title = computed(() => isRegister.value ? '创建账户' : '欢迎回来')
const submitText = computed(() => isRegister.value ? '注册' : '登录')
const switchText = computed(() => isRegister.value ? '已有账户？' : '没有账户？')
const switchAction = computed(() => isRegister.value ? '立即登录' : '立即注册')

const passwordMismatch = computed(() => {
  return isRegister.value && form.value.confirmPassword !== '' && form.value.password !== form.value.confirmPassword
})

// 登录接口：响应对象
interface LoginResponse{
  access_token: string,
  token_type: string,
}

const loginErrorMessage = ref<string>()

async function handleSubmit() {
  if (isRegister.value && form.value.password !== form.value.confirmPassword) {
    return
  }

  // 登录
  if (!isRegister.value) {
    try {
      const res = await httpInstance.post<any, Response>("/auth/login", form.value);
      if (res.code !== 200) {
        loginErrorMessage.value = res.message
        return
      }
      localStorage.setItem('token', res.data.access_token)
      router.push({name: "dashboard"})
    } catch (error) {
      alert(`系统错误:${error}`)
    }
  } else {
    // 注册
    try {
      const res = await httpInstance.post<any, Response>("/auth/register", form.value)
      if (res.code !== 200) {
        loginErrorMessage.value = res.message
        return
      }
      localStorage.setItem('token', res.data.access_token)
      router.push({name: "dashboard"})
    } catch (error) {
      alert(`系统错误:${error}`)
    }

  }

}

function toggleMode() {
  isRegister.value = !isRegister.value
  form.value.password = ''
  form.value.confirmPassword = ''
}
</script>

<template>
  <div class="login-page">
    <div class="left-panel">
      <img src="@/static/loginPageSlogan.png" alt="" class="bg-image" />
    </div>
    <div class="right-panel">
      <div class="form-container">
        <h1 class="form-title">{{ title }}</h1>
        <form @submit.prevent="handleSubmit" class="login-form">
          <Transition name="fade" mode="out-in">
            <div :key="isRegister ? 'register' : 'login'" class="form-fields">
              <div class="form-group">
                <input
                  v-model="form.username"
                  type="text"
                  placeholder="账号"
                  class="form-input"
                  required
                />
              </div>
              <div class="form-group">
                <input
                  v-model="form.password"
                  type="password"
                  placeholder="密码"
                  class="form-input"
                  required
                />
                <span v-if="loginErrorMessage && !isRegister" class="error-text">{{ loginErrorMessage }}</span>
              </div>
              <div v-if="isRegister" class="form-group">
                <input
                  v-model="form.confirmPassword"
                  type="password"
                  placeholder="重复密码"
                  class="form-input"
                  :class="{ 'input-error': passwordMismatch }"
                  required
                />
                <span v-if="passwordMismatch" class="error-text">两次密码输入不一致</span>
              </div>
              <div v-if="isRegister" class="form-group">
                <input
                  v-model="form.secretKey"
                  type="text"
                  placeholder="系统标识密钥"
                  class="form-input"
                  required
                />
                <span v-if="loginErrorMessage && isRegister" class="error-text">{{ loginErrorMessage }}</span>
              </div>
              <button type="submit" class="submit-btn">{{ submitText }}</button>
            </div>
          </Transition>
        </form>
        <p class="switch-text">
          {{ switchText }}
          <span class="switch-action" @click="toggleMode">{{ switchAction }}</span>
          或
          <span class="switch-action" @click="getHome">返回主页</span>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.login-page {
  display: flex;
  width: 100vw;
  height: 100vh;
}

.left-panel {
  flex: 1;
  background: rgb(218, 232, 252);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.bg-image {
  width: 95%;
  height: auto;
  object-fit: contain;
  border-radius: 16px;
}

.right-panel {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(218, 231, 252);
}

.form-container {
  width: 100%;
  max-width: 360px;
  min-height: 380px;
  padding: 40px;
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 16px;
  box-shadow: 
    0 8px 32px rgba(174, 190, 220, 0.25),
    0 2px 8px rgba(174, 190, 220, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.4);
  display: flex;
  flex-direction: column;
  position: relative;
  right: 15%;
}

.form-title {
  font-size: 22px;
  font-weight: 700;
  color: #334155;
  margin-bottom: 32px;
  text-align: center;
  letter-spacing: 0.5px;
}

.login-form {
  display: flex;
  flex-direction: column;
}

.form-fields {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.form-group {
  width: 100%;
}

.form-input {
  width: 100%;
  padding: 14px 16px;
  font-size: 15px;
  border: 1px solid rgba(148, 163, 184, 0.3);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.35);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  transition: all 0.3s;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.04);
}

.form-input:focus {
  outline: none;
  border-color: #60a5fa;
  background: rgba(255, 255, 255, 0.5);
  box-shadow: 
    0 0 0 3px rgba(96, 165, 250, 0.15),
    inset 0 1px 2px rgba(0, 0, 0, 0.04);
}

.form-input::placeholder {
  color: #64748b;
}

.switch-text {
  text-align: center;
  margin-top: 24px;
  font-size: 14px;
  color: #475569;
}

.submit-btn {
  width: 100%;
  padding: 14px;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  border: 1px solid rgba(148, 163, 184, 0.25);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 8px;
  box-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.06),
    0 1px 2px rgba(0, 0, 0, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.7);
}

.submit-btn:hover {
  transform: translateY(-2px);
  background: linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%);
  box-shadow: 
    0 6px 16px rgba(148, 163, 184, 0.25),
    0 2px 4px rgba(0, 0, 0, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

.submit-btn:active {
  transform: translateY(0);
  background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
  box-shadow: 
    0 1px 2px rgba(0, 0, 0, 0.04),
    inset 0 2px 4px rgba(0, 0, 0, 0.05);
}

.switch-text {
  text-align: center;
  margin-top: 24px;
  font-size: 14px;
  color: #475569;
}

.switch-action {
  color: #0ea5e9;
  cursor: pointer;
  margin: 0 2px;
  font-weight: 600;
  transition: color 0.2s;
}

.switch-action:hover {
  color: #0284c7;
  text-decoration: none;
}

.input-error {
  border-color: #ef4444;
}

.input-error:focus {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15);
}

.error-text {
  display: block;
  font-size: 12px;
  color: #ef4444;
  margin-top: 6px;
  padding-left: 4px;
}
</style>