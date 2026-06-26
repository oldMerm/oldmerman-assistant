<script setup lang="ts">
import { ref } from 'vue'
import router from '@/router'
import { httpInstance, type Response } from '@/utils/http'
import ChatCard from './components/ChatCard/index.vue'

const navItems = ref([
  { label: '文档', href: 'https://oldmerman.cn' },
  { label: 'GitHub', href: 'https://github.com/oldMerm' },
])

const chatVisible = ref(false)
const chatCardRef = ref<InstanceType<typeof ChatCard> | null>(null)

const startChat = () => {
  chatVisible.value = true
}

function getParticleStyle(index: number) {
  let left: number, top: number
  const rand = Math.random()
  if (rand < 0.5) {
    const angle = Math.random() * Math.PI * 2
    const radius = Math.random() * 35
    left = 50 + Math.cos(angle) * radius
    top = 45 + Math.sin(angle) * radius
  } else {
    left = Math.random() * 100
    top = Math.random() * 100
  }
  return {
    left: `${left}%`,
    top: `${top}%`,
    animationDelay: `${Math.random() * 5}s`,
    animationDuration: `${3 + Math.random() * 4}s`
  }
}

// 跳转到控制台
const goToDashboard = async() => {
  const res = await httpInstance.get<any, Response>("/auth/verify");
  if(res.code === 200) router.push({name: "dashboard"});
}
</script>

<template>
  <div class="home-page">
    <div class="particles">
      <div v-for="i in 30" :key="i" class="particle" :style="getParticleStyle(i)"></div>
    </div>

    <header class="topbar">
      <div class="topbar-content">
        <div class="logo">oldmerman</div>
        <nav class="nav-links">
          <a v-for="item in navItems" :key="item.label" :href="item.href" class="nav-link">
            {{ item.label }}
          </a>
        </nav>
      </div>
    </header>

    <main class="main">
      <div class="main-content">
        <h1 class="title">老鱼人知识库</h1>
        <p class="subtitle">轻松搭建个人知识库，让信息有序流转！</p>
        <div class="buttons">
          <button class="btn btn-primary" @click="startChat">开始对话</button>
          <button class="btn btn-secondary" @click="goToDashboard">控制面板</button>
        </div>
      </div>
      <p class="footer-tip">请注意保护个人隐私</p>
    </main>

    <ChatCard v-model:visible="chatVisible" ref="chatCardRef" />
  </div>
</template>

<style scoped>
@import url("/src/style/o-topbar1.css");

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.home-page {
  width: 100%;
  height: 100vh;
  background: linear-gradient(135deg, #e8f4fc 0%, #d4ecf7 50%, #f0f7fc 100%);
  position: relative;
  overflow: hidden;
}

.particles {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.particle {
  position: absolute;
  width: 6px;
  height: 6px;
  background: rgba(59, 130, 246, 0.3);
  border-radius: 50%;
  animation: float 5s ease-in-out infinite;
}

.particle:nth-child(odd) {
  background: rgba(96, 165, 250, 0.4);
}

.particle:nth-child(3n) {
  width: 4px;
  height: 4px;
  background: rgba(147, 197, 253, 0.5);
}

@keyframes float {

  0%,
  100% {
    transform: translateY(0) scale(1);
    opacity: 0.6;
  }

  50% {
    transform: translateY(-20px) scale(1.2);
    opacity: 1;
  }
}


.main {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  height: calc(100vh - 57px);
  z-index: 5;
}

.main-content {
  text-align: center;
  max-width: 600px;
  padding: 0 40px;
}

.title {
  font-size: 60px;
  font-weight: 800;
  margin-bottom: 20px;
  background: linear-gradient(135deg, #2563eb 0%, #3b82f6 50%, #60a5fa 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  font-size: 16px;
  color: #64748b;
  margin-bottom: 50px;
  line-height: 1.6;
}

.buttons {
  display: flex;
  justify-content: center;
  gap: 45px;
}

.btn {
  padding: 12px 28px;
  font-size: 15px;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  box-shadow: 0 4px 14px rgba(59, 130, 246, 0.4);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.5);
}

.btn-secondary {
  background: white;
  color: #3b82f6;
  border: 2px solid #3b82f6;
}

.btn-secondary:hover {
  transform: translateY(-2px);
  background: #f0f7fc;
  box-shadow: 0 4px 14px rgba(59, 130, 246, 0.2);
}

.footer-tip {
  position: fixed;
  z-index: 1;
  bottom: 1%;
  left: 50%;
  transform: translateX(-50%);
  font-size: 13px;
  color: #94a3b8;
}
</style>
