<script setup lang="ts">
import { ref, computed } from 'vue'

interface Model {
  id: string
  name: string
}

interface ModelCategory {
  id: string
  name: string
  models: Model[]
}

interface Provider {
  id: string
  name: string
  logo?: string
  apiKey: string
  modelCount: number
  createdAt: string
  categories: ModelCategory[]
}

const getLogoDisplay = (provider: Provider) => {
  if (provider.logo) {
    return { type: 'img' as const, src: provider.logo }
  }
  return { type: 'text' as const, text: provider.name[0] }
}

const mockProviders: Provider[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    apiKey: 'sk-**** **** **** ****',
    modelCount: 12,
    createdAt: '2024-01-15',
    categories: [
      {
        id: 'chat',
        name: '聊天模型',
        models: [
          { id: 'gpt-4.5', name: 'gpt-4.5' },
          { id: 'gpt-4-turbo', name: 'gpt-4-turbo' },
          { id: 'gpt-4', name: 'gpt-4' },
          { id: 'gpt-3.5-turbo', name: 'gpt-3.5-turbo' },
          { id: 'o1', name: 'o1' },
          { id: 'o1-mini', name: 'o1-mini' },
          { id: 'o1-preview', name: 'o1-preview' },
          { id: 'o3', name: 'o3' },
          { id: 'o3-mini', name: 'o3-mini' },
          { id: 'o4-mini', name: 'o4-mini' }
        ]
      },
      {
        id: 'image',
        name: '文生图',
        models: [
          { id: 'dall-e-3', name: 'dall-e-3' },
          { id: 'dall-e-2', name: 'dall-e-2' }
        ]
      },
      {
        id: 'embedding',
        name: '嵌入模型',
        models: [
          { id: 'text-embedding-3-large', name: 'text-embedding-3-large' },
          { id: 'text-embedding-3-small', name: 'text-embedding-3-small' },
          { id: 'text-embedding-ada-002', name: 'text-embedding-ada-002' }
        ]
      }
    ]
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    apiKey: 'sk-ant-**** **** ****',
    modelCount: 8,
    createdAt: '2024-02-20',
    categories: [
      {
        id: 'chat',
        name: '聊天模型',
        models: [
          { id: 'claude-sonnet-4-20250514', name: 'claude-sonnet-4-20250514' },
          { id: 'claude-3-5-sonnet-20241022', name: 'claude-3-5-sonnet-20241022' },
          { id: 'claude-3-5-sonnet-20240620', name: 'claude-3-5-sonnet-20240620' },
          { id: 'claude-3-opus-20240229', name: 'claude-3-opus-20240229' },
          { id: 'claude-3-sonnet-20240229', name: 'claude-3-sonnet-20240229' },
          { id: 'claude-3-haiku-20240307', name: 'claude-3-haiku-20240307' }
        ]
      },
      {
        id: 'embedding',
        name: '嵌入模型',
        models: [
          { id: 'claude-embedding-v1', name: 'claude-embedding-v1' }
        ]
      }
    ]
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    logo: '/image/deepseek.svg',
    apiKey: 'sk-deepseek-****',
    modelCount: 6,
    createdAt: '2024-03-10',
    categories: [
      {
        id: 'chat',
        name: '聊天模型',
        models: [
          { id: 'deepseek-chat', name: 'deepseek-chat' },
          { id: 'deepseek-coder', name: 'deepseek-coder' },
          { id: 'deepseek-pro', name: 'deepseek-pro' },
          { id: 'deepseek-distill', name: 'deepseek-distill' }
        ]
      },
      {
        id: 'reasoning',
        name: '推理模型',
        models: [
          { id: 'deepseek-reasoner', name: 'deepseek-reasoner' },
          { id: 'deepseek-r1', name: 'deepseek-r1' }
        ]
      }
    ]
  }
]

const providers = ref<Provider[]>(mockProviders)
const selectedProvider = ref<Provider>(mockProviders[0]!)
const showDropdown = ref(false)
const isScrolling = ref(false)
const scrollTimeout = ref<number | null>(null)
const containerRef = ref<HTMLElement | null>(null)

const currentCategories = computed(() => selectedProvider.value?.categories ?? [])

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}

const selectProvider = (provider: Provider) => {
  selectedProvider.value = provider
  showDropdown.value = false
}

const deleteModel = (categoryId: string, modelId: string) => {
  const category = selectedProvider.value?.categories.find(c => c.id === categoryId)
  if (category) {
    category.models = category.models.filter(m => m.id !== modelId)
    selectedProvider.value!.modelCount = selectedProvider.value!.categories.reduce(
      (sum, cat) => sum + cat.models.length, 0
    )
  }
}

const handleScroll = () => {
  isScrolling.value = true
  if (scrollTimeout.value) {
    clearTimeout(scrollTimeout.value)
  }
  scrollTimeout.value = window.setTimeout(() => {
    isScrolling.value = false
  }, 300)
}
</script>

<template>
  <div class="component2-container" ref="containerRef" @scroll="handleScroll">
    <div class="provider-section">
      <div class="provider-left">
        <div class="provider-select-wrapper">
          <div class="provider-select" @click="toggleDropdown">
            <div class="provider-current">
              <div class="provider-logo" :class="{ 'has-img': getLogoDisplay(selectedProvider).type === 'img' }">
                <img v-if="getLogoDisplay(selectedProvider).type === 'img'" :src="getLogoDisplay(selectedProvider).src" :alt="selectedProvider.name"/>
                <span v-else>{{ getLogoDisplay(selectedProvider).text }}</span>
              </div>
              <div class="provider-basic-info">
                <div class="provider-name">{{ selectedProvider.name }}</div>
                <span class="select-arrow">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                    <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" stroke-width="1.5" fill="none"/>
                  </svg>
                </span>
              </div>
            </div>
          </div>
          <Transition name="dropdown">
            <div v-if="showDropdown" class="provider-dropdown">
              <div 
                v-for="provider in providers" 
                :key="provider.id"
                class="provider-option"
                :class="{ active: provider.id === selectedProvider.id }"
                @click.stop="selectProvider(provider)"
              >
                <div class="provider-logo" :class="{ 'has-img': getLogoDisplay(provider).type === 'img' }">
                  <img v-if="getLogoDisplay(provider).type === 'img'" :src="getLogoDisplay(provider).src" :alt="provider.name"/>
                  <span v-else>{{ getLogoDisplay(provider).text }}</span>
                </div>
                <div class="provider-name">{{ provider.name }}</div>
              </div>
              <div class="provider-option add-group">
                + 添加提供商
              </div>
            </div>
          </Transition>
        </div>

        <div class="provider-detail">
          <div class="detail-row">
            <span class="detail-label">默认API-Key:</span>
            <span class="detail-value">{{ selectedProvider.apiKey }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">模型总数:</span>
            <span class="detail-value">{{ selectedProvider.modelCount }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">创建时间:</span>
            <span class="detail-value">{{ selectedProvider.createdAt }}</span>
          </div>
        </div>
      </div>

      <div class="add-model-btn">
        <span>+ 添加模型</span>
      </div>
    </div>

    <div class="categories-grid">
      <div 
        v-for="category in currentCategories" 
        :key="category.id"
        class="category-card"
      >
        <div class="category-header">{{ category.name }}</div>
        <div class="model-list">
          <div class="model-column" v-for="col in 2" :key="col">
            <div 
              v-for="(model, idx) in category.models.slice((col-1)*5, col*5)" 
              :key="model.id"
              class="model-item"
            >
              <span class="model-name">{{ model.name }}</span>
              <span class="model-delete" @click="deleteModel(category.id, model.id)">×</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <Transition name="fade">
      <div v-if="!isScrolling" class="footer-tips">
        点击模型名称后的×可删除该模型
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.component2-container {
  background: rgba(249, 249, 249, 0.85);
  border-radius: 12px;
  padding: 24px;
  margin: 16px;
  min-height: calc(100% - 32px);
}

.provider-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 32px;
  flex-wrap: wrap;
}

.provider-left {
  display: flex;
  align-items: flex-start;
  gap: 32px;
  flex: 1;
}

.provider-select-wrapper {
  position: relative;
  flex-shrink: 0;
  margin-top: 15px;
}

.provider-select {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #fff;
  border-radius: 10px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(0, 0, 0, 0.08);
  transition: all 0.25s ease;
  min-width: 180px;
}

.provider-select:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.provider-current {
  display: flex;
  align-items: center;
  gap: 12px;
}

.provider-logo {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 20px;
  font-weight: 700;
  font-family: 'DM Sans', 'Outfit', sans-serif;
}

.provider-logo.has-svg {
  background: #fff;
  padding: 6px;
}

.provider-logo.has-svg svg {
  width: 100%;
  height: 100%;
}

.provider-logo.has-img {
  background: #fff;
  padding: 6px;
}

.provider-logo.has-img img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.provider-basic-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.provider-name {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a2e;
  font-family: 'Outfit', sans-serif;
}

.select-arrow {
  display: flex;
  align-items: center;
  color: #888;
  padding-top: 2px;
}

.provider-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  border: 1px solid rgba(0, 0, 0, 0.08);
  overflow: hidden;
  z-index: 100;
  min-width: 180px;
}

.provider-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.provider-option:hover {
  background: rgba(102, 126, 234, 0.08);
}

.provider-option.active {
  background: rgba(102, 126, 234, 0.12);
}

.provider-option .provider-logo {
  width: 36px;
  height: 36px;
  font-size: 16px;
}

.provider-option .provider-logo.has-svg {
  background: #fff;
  padding: 4px;
}

.provider-option .provider-logo.has-svg svg {
  width: 100%;
  height: 100%;
}

.provider-option .provider-logo.has-img {
  background: #fff;
  padding: 4px;
}

.provider-option .provider-logo.has-img img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.provider-option .provider-name {
  font-size: 16px;
}

.provider-detail {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 0;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-label {
  font-size: 14px;
  color: #888;
  font-weight: 500;
}

.detail-value {
  font-size: 14px;
  color: #333;
  font-weight: 600;
  font-family: 'JetBrains Mono', monospace;
}

.add-model-btn {
  padding: 12px 24px;
  background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
  border-radius: 10px;
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.3);
  flex-shrink: 0;
}

.add-model-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(59, 130, 246, 0.4);
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.category-card {
  background: #fff;
  border-radius: 14px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
}

.category-card:hover {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transform: translateY(-4px);
}

.category-header {
  font-size: 17px;
  font-weight: 700;
  color: #1a1a2e;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid #f0f0f0;
  font-family: 'Outfit', sans-serif;
}

.model-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 4px 12px;
}

.model-column {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.model-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  border-radius: 8px;
  transition: all 0.2s ease;
  cursor: default;
}

.model-name {
  font-size: 15px;
  color: #333;
  font-weight: 600;
  font-family: 'JetBrains Mono', monospace;
  transition: color 0.2s ease;
}

.model-delete {
  opacity: 0;
  color: #e74c3c;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.model-item:hover {
  background: rgba(102, 126, 234, 0.08);
}

.model-item:hover .model-name {
  color: #667eea;
}

.model-item:hover .model-delete {
  opacity: 1;
}

.model-delete:hover {
  background: #fee;
  color: #c0392b;
}

.footer-tips {
  font-size: 13px;
  color: #999;
  padding-top: 16px;
  border-top: 1px solid #eee;
  font-style: italic;
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.25s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 1024px) {
  .categories-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .categories-grid {
    grid-template-columns: 1fr;
  }
}
</style>