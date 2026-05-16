<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { httpInstance, type Response } from '@/utils/http'
import Toast from '@/utils/toast/Toast.vue'

// 分组信息（对应后端 ModelsGroup）
interface ModelsGroup {
  id?: number
  group_uuid: string
  group_name?: string
  group_attr?: string
  created_at?: string
  api_key?: string
  base_url?: string
}

// 分组渲染信息（对应后端 ModelsGroupRender，用于下拉框）
interface ModelsGroupRender {
  group_uuid: string
  group_name?: string
  group_attr?: string
}

// 模型渲染参数（对应后端 ModelRenderParam）
interface ModelRenderParam {
  model_id?: number | null
  model_name?: string | null
  type_id?: number | null
  type_name?: string | null
}

// 分类后的模型组
interface CategoryGroup {
  type_id: number
  type_name: string
  models: ModelRenderParam[]
}

/**
 * 获取Logo显示方式
 * - 若group_attr中包含logo_url则显示图片
 * - 否则显示首字母大写
 */
const getLogoDisplay = (group: ModelsGroupRender) => {
  if (group.group_attr) {
    try {
      const attr = JSON.parse(group.group_attr)
      if (attr.logo_url) {
        return { type: 'img' as const, src: attr.logo_url }
      }
    } catch { }
  }
  return { type: 'text' as const, text: group.group_name?.[0]?.toUpperCase() || '?' }
}

// 状态定义
const groupList = ref<ModelsGroupRender[]>([])         // 下拉框分组列表
const currentGroup = ref<ModelsGroup | null>(null)     // 当前选中的分组
const categories = ref<CategoryGroup[]>([])           // 分类后的模型列表
const showDropdown = ref(false)                       // 下拉框显示状态
const isScrolling = ref(false)                        // 滚动状态（控制tips显示）
const scrollTimeout = ref<number | null>(null)        // 滚动防抖定时器
const containerRef = ref<HTMLElement | null>(null)    // 容器引用
const isLoading = ref(false)                          // 加载状态

// Toast 状态
const toastRef = ref()
const toastMsg = ref('')
const toastType = ref<'success' | 'error'>('error')

/**
 * 显示Toast提示
 * @param message 提示信息
 * @param type 提示类型
 */
const showToast = (message: string, type: 'success' | 'error' = 'error') => {
  toastMsg.value = message
  toastType.value = type
  toastRef.value?.show()
}

/**
 * 格式化API Key显示，隐藏部分字符
 * 保留前几位，末尾加5个星号
 */
const formatApiKey = (apiKey?: string | null) => {
  if (!apiKey) return '-'
  if (apiKey.length <= 8) return apiKey
  const visibleCount = Math.floor(apiKey.length * 0.3)
  return apiKey.slice(0, visibleCount) + '*****'
}

const currentCategories = computed(() => categories.value)

// 当前分组的Logo显示（用于顶部显示）
const currentLogoDisplay = computed(() => {
  if (currentGroup.value?.group_attr) {
    try {
      const attr = JSON.parse(currentGroup.value.group_attr)
      if (attr.logo_url) {
        return { type: 'img' as const, src: attr.logo_url }
      }
    } catch { }
  }
  return { type: 'text' as const, text: currentGroup.value?.group_name?.[0]?.toUpperCase() || '?' }
})

/**
 * 获取默认分组并渲染
 * 首次加载时调用，不传group_uuid获取默认分组
 */
const fetchDefaultGroup = async () => {
  try {
    const res = await httpInstance.get<any, Response>('/model_group')
    if (res.code !== 200) {
      showToast(res.message || '获取分组失败!')
      return
    }
    if (res.data) {
      currentGroup.value = res.data
      if (res.data.group_uuid) {
        await fetchGroupModels(res.data.group_uuid)
      }
    }
  } catch (error) {
    showToast(`获取分组失败:${error}!`)
  }
}

/**
 * 获取指定分组的模型列表并按分类渲染
 * @param groupUuid 分组的uuid
 */
const fetchGroupModels = async (groupUuid: string) => {
  try {
    isLoading.value = true
    const res = await httpInstance.get<any, Response>(`/model/render?group_uuid=${groupUuid}`)
    if (res.code !== 200) {
      showToast(res.message || '获取模型列表失败!')
      return
    }
    if (res.data) {
      const modelList: ModelRenderParam[] = res.data
      const grouped = groupModelsByType(modelList)
      categories.value = grouped
    }
  } catch (error) {
    showToast(`获取模型列表失败:${error}!`)
  } finally {
    isLoading.value = false
  }
}

/**
 * 将模型列表按type_id分类
 * @param models 模型列表
 * @returns 分类后的模型组
 */
const groupModelsByType = (models: ModelRenderParam[]): CategoryGroup[] => {
  const map = new Map<number, CategoryGroup>()
  for (const model of models) {
    const typeId = model.type_id
    if (typeId === null || typeId === undefined) continue
    const id = Number(typeId)
    if (!map.has(id)) {
      map.set(id, {
        type_id: id,
        type_name: model.type_name || '未命名分类',
        models: []
      })
    }
    map.get(id)!.models.push(model)
  }
  return Array.from(map.values())
}

/**
 * 获取所有分组列表（用于下拉框）
 */
const fetchAllGroups = async () => {
  try {
    const res = await httpInstance.get<any, Response>('/model_group/render')
    if (res.code !== 200) {
      showToast(res.message || '获取分组列表失败!')
      return
    }
    if (res.data) {
      groupList.value = res.data
    }
  } catch (error) {
    showToast(`获取分组列表失败:${error}!`)
  }
}

// 组件挂载时获取默认分组
onMounted(async () => {
  await fetchDefaultGroup()
})

/**
 * 切换下拉框显示
 * 首次打开时加载所有分组列表
 */
const toggleDropdown = async () => {
  if (!showDropdown.value && groupList.value.length === 0) {
    await fetchAllGroups()
  }
  showDropdown.value = !showDropdown.value
}

/**
 * 选择分组并渲染对应的模型
 * @param group 选中的分组
 */
const selectGroup = async (group: ModelsGroupRender) => {
  showDropdown.value = false
  try {
    // 获取该分组的完整信息（包含api_key、base_url等）
    const res = await httpInstance.get<any, Response>(`/model_group?group_uuid=${group.group_uuid}`)
    if (res.code !== 200) {
      showToast(res.message || '获取分组信息失败!')
      return
    }
    if (res.data) {
      currentGroup.value = res.data
    }
    // 获取该分组的模型列表
    await fetchGroupModels(group.group_uuid)
  } catch (error) {
    showToast(`选择分组失败:${error}!`)
  }
}

/**
 * 删除模型（本地状态更新，后端需另外处理）
 * @param typeId 分类ID
 * @param modelId 模型ID
 */
const deleteModel = (typeId: number, modelId: number | null) => {
  if (modelId === null || modelId === undefined) return
  const category = categories.value.find(c => c.type_id === typeId)
  if (category) {
    category.models = category.models.filter(m => m.model_id !== modelId)
  }
}

// 处理滚动事件（控制footer-tips显示）
const handleScroll = () => {
  isScrolling.value = true
  if (scrollTimeout.value) {
    clearTimeout(scrollTimeout.value)
  }
  scrollTimeout.value = window.setTimeout(() => {
    isScrolling.value = false
  }, 300)
}

// 弹框
import Dialog from '@/utils/dialog/Dialog.vue'
const dialogVisible = ref(false)
const pendingDelete = ref<{ typeId: number; modelId: number | null } | null>(null)

const openDeleteDialog = (typeId: number, modelId: number | null) => {
  pendingDelete.value = { typeId, modelId }
  dialogVisible.value = true
}

const onConfirmDelete = () => {
  if (pendingDelete.value) {
    deleteModel(pendingDelete.value.typeId, pendingDelete.value.modelId)
    pendingDelete.value = null
  }
  dialogVisible.value = false
}

</script>

<template>
  <div class="component2-container" ref="containerRef" @scroll="handleScroll">
    <div v-if="isLoading" class="loading-state">加载中...</div>
    <template v-else>
      <div class="provider-section">
        <div class="provider-left">
          <div class="provider-select-wrapper">
            <div class="provider-select" @click="toggleDropdown">
              <div class="provider-current">
                <div class="provider-logo" :class="{ 'has-img': currentLogoDisplay.type === 'img' }">
                  <img v-if="currentLogoDisplay.type === 'img'" :src="currentLogoDisplay.src"
                    :alt="currentGroup?.group_name" />
                  <span v-else>{{ currentLogoDisplay.text }}</span>
                </div>
                <div class="provider-basic-info">
                  <div class="provider-name">{{ currentGroup?.group_name || '加载中...' }}</div>
                  <span class="select-arrow">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                      <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" stroke-width="1.5" fill="none" />
                    </svg>
                  </span>
                </div>
              </div>
            </div>
            <Transition name="dropdown">
              <div v-if="showDropdown" class="provider-dropdown">
                <div v-for="group in groupList" :key="group.group_uuid" class="provider-option"
                  :class="{ active: group.group_uuid === currentGroup?.group_uuid }" @click.stop="selectGroup(group)">
                  <div class="provider-logo" :class="{ 'has-img': getLogoDisplay(group).type === 'img' }">
                    <img v-if="getLogoDisplay(group).type === 'img'" :src="getLogoDisplay(group).src"
                      :alt="group.group_name" />
                    <span v-else>{{ getLogoDisplay(group).text }}</span>
                  </div>
                  <div class="provider-name">{{ group.group_name }}</div>
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
              <span class="detail-value">{{ formatApiKey(currentGroup?.api_key) }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Base URL:</span>
              <span class="detail-value">{{ currentGroup?.base_url || '-' }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">创建时间:</span>
              <span class="detail-value">{{ currentGroup?.created_at || '-' }}</span>
            </div>
          </div>
        </div>

        <div class="add-model-btn">
          <span>+ 添加模型</span>
        </div>
      </div>

      <div class="categories-grid">
        <div v-for="category in currentCategories" :key="category.type_id" class="category-card">
          <div class="category-header">{{ category.type_name }}</div>
          <div class="model-list">
            <div class="model-column" v-for="col in 2" :key="col">
              <div v-for="(model, idx) in category.models.slice((col - 1) * 5, col * 5)" :key="model.model_id ?? idx"
                class="model-item">
                <span class="model-name">{{ model.model_name }}</span>
                <span class="model-delete" @click="openDeleteDialog(category.type_id, model.model_id ?? null)">×</span>
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
    </template>
  </div>

  <Dialog 
    v-model:visible="dialogVisible"
    title="确认删除" 
    content="确定要执行删除操作吗？此操作无法撤销。" 
    @confirm="onConfirmDelete"
    @cancel="dialogVisible = false"
  />
  <Toast ref="toastRef" :message="toastMsg" :type="toastType" :duration="1500" />
</template>

<style scoped>
.component2-container {
  background: rgba(249, 249, 249, 0.85);
  border-radius: 12px;
  padding: 24px;
  margin: 16px;
  min-height: calc(100% - 32px);
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  color: #888;
  font-size: 14px;
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