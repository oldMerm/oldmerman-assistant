<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { httpInstance, type Response } from '@/utils/http'
import Toast from '@/utils/toast/Toast.vue'
import Dialog from '@/utils/dialog/Dialog.vue'

interface VectorCollection {
  id?: number
  embedding_id?: number | null
  embedding_name?: string | null
  collection_name?: string | null
  collection_alias?: string | null
  collection_description?: string | null
  items_number?: number | null
  created_at?: string
  dimensions?: number | null
}

interface VectorCollectionParam {
  embedding_id?: number | null
  collection_name?: string | null
  collection_alias?: string | null
  collection_description?: string | null
  items_number?: number | null
  dimensions?: number | null
}

interface ModelRenderParam1 {
  model_id?: number | null
  model_name?: string | null
}

interface ModelsWithTypeParam {
  type_id?: number | null
  type_name?: string | null
  models?: ModelRenderParam1[] | null
}

const collectionList = ref<VectorCollection[]>([])
const isLoading = ref(false)

const toastRef = ref()
const toastMsg = ref('')
const toastType = ref<'success' | 'error'>('error')

const showToast = (message: string, type: 'success' | 'error' = 'error') => {
  toastMsg.value = message
  toastType.value = type
  toastRef.value?.show()
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '-'
  try {
    const date = new Date(dateStr)
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  } catch {
    return dateStr
  }
}

const fetchCollections = async () => {
  try {
    isLoading.value = true
    const res = await httpInstance.get<any, Response>('/vector-manage/render')
    if (res.code !== 200) {
      showToast(res.message || '获取集合列表失败!')
      return
    }
    if (res.data) {
      collectionList.value = res.data
    }
  } catch (error) {
    showToast(`获取集合列表失败:${error}!`)
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  await fetchCollections()
})

const addCollectionVisible = ref(false)
const addCollectionForm = ref<VectorCollectionParam>({
  collection_name: '',
  collection_alias: '',
  collection_description: '',
  items_number: 0,
  dimensions: 1024
})
const addCollectionLoading = ref(false)

const vectorModels = ref<ModelRenderParam1[]>([])
const vectorModelsLoading = ref(false)
const dropdownOpen = ref(false)

const selectedModelName = computed(() => {
  const m = vectorModels.value.find(m => m.model_id === addCollectionForm.value.embedding_id)
  return m?.model_name || null
})

const toggleDropdown = () => {
  dropdownOpen.value = !dropdownOpen.value
  if (dropdownOpen.value) {
    fetchVectorModels()
  }
}

const selectModel = (m: ModelRenderParam1) => {
  addCollectionForm.value.embedding_id = m.model_id ?? null
  dropdownOpen.value = false
}

const closeDropdown = () => {
  dropdownOpen.value = false
}

const fetchVectorModels = async () => {
  if (vectorModels.value.length > 0) return
  vectorModelsLoading.value = true
  try {
    const res = await httpInstance.get<any, Response>('/model_type/vector-models', { params: { type_name: '向量模型' } })
    if (res.code !== 200) {
      showToast(res.message || '获取向量模型失败!')
      return
    }
    if (res.data?.models) {
      vectorModels.value = res.data.models
    }
  } catch (error) {
    showToast(`获取向量模型失败:${error}!`)
  } finally {
    vectorModelsLoading.value = false
  }
}

const openAddCollectionDialog = () => {
  addCollectionForm.value = {
    collection_name: '',
    collection_alias: '',
    collection_description: '',
    items_number: 0,
    embedding_id: null
  }
  addCollectionVisible.value = true
}

const validateCollectionName = (name: string): string | null => {
  if (name.length < 3 || name.length > 512) {
    return '集合名称长度必须在3~512个字符之间!'
  }
  if (!/^[a-z0-9]/.test(name)) {
    return '集合名称必须以小写字母或数字开头!'
  }
  if (!/[a-z0-9]$/.test(name)) {
    return '集合名称必须以小写字母或数字结尾!'
  }
  if (!/^[a-z0-9][a-z0-9.\-_]*[a-z0-9]$/.test(name)) {
    return '集合名称只能包含小写字母、数字、点、连字符和下划线!'
  }
  if (/\.\./.test(name)) {
    return '集合名称不能包含连续的两个点!'
  }
  if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(name)) {
    return '集合名称不能是有效的IP地址!'
  }
  return null
}

const onConfirmAddCollection = async () => {
  const name = addCollectionForm.value.collection_name
  if (!name) {
    showToast('请填写集合名称!')
    return
  }
  const validationError = validateCollectionName(name)
  if (validationError) {
    showToast(validationError)
    return
  }

  const dim = addCollectionForm.value.dimensions;
  if (dim !== undefined && dim !== null) {
    if (dim % 256 !== 0 || dim < 256 || dim > 2048) {
      showToast('向量维度必须是256的倍数，且范围在256~2048之间');
      return;
    }
  }
  addCollectionLoading.value = true
  try {
    const res = await httpInstance.post<any, Response>('/vector-manage', addCollectionForm.value)
    if (res.code !== 200) {
      showToast(`集合添加失败:${res.message}` || '添加集合失败!')
      return
    }
    addCollectionVisible.value = false
    showToast('添加成功!', 'success')
    await fetchCollections()
  } catch (error) {
    showToast(`添加集合失败:${error}!`)
  } finally {
    addCollectionLoading.value = false
  }
}

const deleteCollectionVisible = ref(false)
const pendingDeleteCollection = ref<VectorCollection | null>(null)

const openDeleteCollectionDialog = (collection: VectorCollection) => {
  pendingDeleteCollection.value = collection
  deleteCollectionVisible.value = true
}

const onConfirmDeleteCollection = async () => {
  const idToRemove = pendingDeleteCollection.value?.id
  if (idToRemove === null || idToRemove === undefined) return

  const res = await httpInstance.delete<any, Response>(`/vector-manage/${idToRemove}`)
  if (res.code !== 200) {
    showToast(`集合删除失败:${res.message}`)
  }
  collectionList.value = collectionList.value.filter(item => item.id !== idToRemove)
  showToast(`集合${':' + pendingDeleteCollection.value?.collection_name || ''}，删除成功!`, 'success')
  deleteCollectionVisible.value = false
  pendingDeleteCollection.value = null
}

const addDocumentVisible = ref(false)
const addDocumentLoading = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)
const addDocumentForm = ref({
  collection_name: '',
  file: null as File | null,
  language: 'en'
})

const languageList = [
  { value: 'en', label: 'English' },
  { value: 'cn', label: '中文' },
]

const addDocCollectionDropdownOpen = ref(false)
const addDocLanguageDropdownOpen = ref(false)

const selectedAddDocCollectionName = computed(() => {
  return addDocumentForm.value.collection_name || null
})

const selectedAddDocLanguage = computed(() => {
  const l = languageList.find(l => l.value === addDocumentForm.value.language)
  return l?.label || null
})

const toggleAddDocCollectionDropdown = () => {
  addDocCollectionDropdownOpen.value = !addDocCollectionDropdownOpen.value
}

const selectAddDocCollection = (name: string) => {
  addDocumentForm.value.collection_name = name
  addDocCollectionDropdownOpen.value = false
}

const closeAddDocCollectionDropdown = () => {
  addDocCollectionDropdownOpen.value = false
}

const toggleAddDocLanguageDropdown = () => {
  addDocLanguageDropdownOpen.value = !addDocLanguageDropdownOpen.value
}

const selectAddDocLanguage = (lang: string) => {
  addDocumentForm.value.language = lang
  addDocLanguageDropdownOpen.value = false
}

const closeAddDocLanguageDropdown = () => {
  addDocLanguageDropdownOpen.value = false
}

const triggerFileInput = () => {
  fileInputRef.value?.click()
}

const onAddDocument = (collection: VectorCollection) => {
  addDocumentForm.value = {
    collection_name: collection.collection_name || '',
    file: null,
    language: 'en'
  }
  addDocumentVisible.value = true
}

const onConfirmAddDocument = async () => {
  if (!addDocumentForm.value.collection_name) {
    showToast('请选择集合!')
    return
  }
  if (!addDocumentForm.value.file) {
    showToast('请选择文件!')
    return
  }
  if (addDocumentForm.value.file.size > 10 * 1024 * 1024) {
    showToast('文件大小不能超过10MB!')
    return
  }
  addDocumentLoading.value = true
  try {
    const formData = new FormData()
    formData.append('collection_name', addDocumentForm.value.collection_name)
    formData.append('file', addDocumentForm.value.file)
    formData.append('language', addDocumentForm.value.language)
    const res = await httpInstance.post<any, Response>('/vector-manage/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    if (res.code !== 200) {
      showToast(res.message || '文档添加失败!')
      return
    }
    addDocumentVisible.value = false
    showToast('文档添加成功!', 'success')
    await fetchCollections()
  } catch (error) {
    showToast(`文档添加失败:${error}!`)
  } finally {
    addDocumentLoading.value = false
  }
}

</script>

<template>
  <div class="component3-container">
    <div v-if="isLoading" class="loading-state">加载中...</div>
    <template v-else>
      <div class="topbar">
        <div class="topbar-left">
          <h2 class="title">知识库管理</h2>
          <span class="total-count">集合总数: {{ collectionList.length || '—' }}</span>
        </div>
        <div class="topbar-right">
          <div class="add-collection-btn" @click="openAddCollectionDialog">
            <span>+ 添加集合</span>
          </div>
        </div>
      </div>

      <div class="collections-grid" v-if="collectionList.length > 0">
        <div v-for="(collection, index) in collectionList" :key="collection.id" class="collection-card"
          :style="{ animationDelay: `${index * 0.06}s` }">
          <div class="card-header">
            <div class="collection-title">
              <span class="name">{{ collection.collection_name || '未命名' }}</span>
              <span class="alias" v-if="collection.collection_alias">({{ collection.collection_alias }})</span>
            </div>
            <span class="delete-icon" @click="openDeleteCollectionDialog(collection)">×</span>
          </div>
          <div class="card-body">
            <div class="collection-desc" v-if="collection.collection_description">{{
              collection.collection_description.substring(0, 20) }}</div>
            <div class="collection-meta">
              <span class="meta-item">📄 {{ collection.items_number ?? 0 }} 条文档</span>
              <span class="meta-item">📅 {{ formatDate(collection.created_at) }}</span>
              <span class="meta-item">📚 {{ collection.dimensions }}</span>
              <span class="meta-item">🤖 {{ collection.embedding_name || 'default_embedding' }}</span>
            </div>
          </div>
          <div class="card-footer">
            <button class="btn-add-doc" @click="onAddDocument(collection)">添加文档</button>
          </div>
        </div>
      </div>
      <div v-else class="empty-state">
        <p>暂无集合，点击右上角"添加集合"创建第一个知识库集合</p>
      </div>

      <div class="footer-tips">
        注意事项：<br>
        1.集合名称不支持中文(3~512字符)<br>
        2.请不要创建太多集合，且建议按语言分类，或者文字图片分类等<br>
        3.注意集合所使用的模型，若删除了对应的模型，则会走默认的模型
      </div>
    </template>
  </div>

  <Dialog v-model:visible="addCollectionVisible" title="添加集合" :confirmLoading="addCollectionLoading"
    @confirm="onConfirmAddCollection" @cancel="addCollectionVisible = false">
    <div class="form-item">
      <label>集合名称 *</label>
      <input v-model="addCollectionForm.collection_name" type="text" placeholder="请输入集合名称" />
    </div>
    <div class="form-item">
      <label>集合别名</label>
      <input v-model="addCollectionForm.collection_alias" type="text" placeholder="请输入集合别名(选填)" />
    </div>
    <div class="form-item">
      <label>集合描述</label>
      <textarea v-model="addCollectionForm.collection_description" placeholder="请输入集合描述(选填)" rows="1"></textarea>
    </div>
    <div class="form-item">
      <label>向量模型</label>
      <div class="custom-select" @blur="closeDropdown" tabindex="0">
        <div class="select-trigger" @click="toggleDropdown">
          <span :class="{ placeholder: !selectedModelName }">{{ selectedModelName || '请选择向量模型' }}</span>
          <span class="arrow" :class="{ open: dropdownOpen }">▾</span>
        </div>
        <Transition name="dropdown">
          <div v-if="dropdownOpen" class="select-dropdown">
            <div v-if="vectorModelsLoading" class="option disabled">加载中...</div>
            <div v-else-if="vectorModels.length === 0" class="option disabled">暂无可用模型</div>
            <div v-for="(m, idx) in vectorModels" :key="m.model_id ?? idx" class="option"
              :class="{ active: addCollectionForm.embedding_id === m.model_id }" @mousedown.prevent="selectModel(m)">{{
                m.model_name }}</div>
          </div>
        </Transition>
      </div>
    </div>
    <div class="form-item">
      <label>维度选择</label>
      <input v-model="addCollectionForm.dimensions" placeholder="向量维度(选填, 必须为256的1~8倍数)"></input>
    </div>
  </Dialog>

  <Dialog v-model:visible="deleteCollectionVisible" title="确认删除" content="确定要删除该集合吗？此操作无法撤销。"
    @confirm="onConfirmDeleteCollection" @cancel="deleteCollectionVisible = false" />

  <Dialog v-model:visible="addDocumentVisible" title="添加文档" :confirmLoading="addDocumentLoading"
    @confirm="onConfirmAddDocument" @cancel="addDocumentVisible = false">
    <template v-if="!addDocumentLoading">
      <div class="form-item">
        <label>选择集合 *</label>
        <div class="custom-select" @blur="closeAddDocCollectionDropdown" tabindex="0">
          <div class="select-trigger" @click="toggleAddDocCollectionDropdown">
            <span :class="{ placeholder: !selectedAddDocCollectionName }">{{ selectedAddDocCollectionName || '请选择集合' }}</span>
            <span class="arrow" :class="{ open: addDocCollectionDropdownOpen }">▾</span>
          </div>
          <Transition name="select-dropdown">
            <div v-if="addDocCollectionDropdownOpen" class="select-dropdown">
              <div v-if="collectionList.length === 0" class="option disabled">暂无集合</div>
              <div v-for="(c, idx) in collectionList" :key="c.id ?? idx" class="option"
                :class="{ active: addDocumentForm.collection_name === c.collection_name }"
                @mousedown.prevent="selectAddDocCollection(c.collection_name ?? '')">{{ c.collection_name }}</div>
            </div>
          </Transition>
        </div>
      </div>
      <div class="form-item">
        <label>选择文件 *</label>
        <input ref="fileInputRef" type="file" @change="addDocumentForm.file = ($event.target as HTMLInputElement).files?.[0] || null" hidden />
        <div class="file-upload-btn" @click="triggerFileInput">
          <span class="upload-icon">📎</span>
          <span v-if="addDocumentForm.file">{{ addDocumentForm.file.name }}</span>
          <span v-else>点击选择文件（最大10MB）</span>
        </div>
      </div>
      <div class="form-item">
        <label>文档语言</label>
        <div class="custom-select" @blur="closeAddDocLanguageDropdown" tabindex="0">
          <div class="select-trigger" @click="toggleAddDocLanguageDropdown">
            <span>{{ selectedAddDocLanguage || 'English' }}</span>
            <span class="arrow" :class="{ open: addDocLanguageDropdownOpen }">▾</span>
          </div>
          <Transition name="select-dropdown">
            <div v-if="addDocLanguageDropdownOpen" class="select-dropdown">
              <div v-for="l in languageList" :key="l.value" class="option"
                :class="{ active: addDocumentForm.language === l.value }"
                @mousedown.prevent="selectAddDocLanguage(l.value)">{{ l.label }}</div>
            </div>
          </Transition>
        </div>
      </div>
    </template>
    <div v-else class="uploading-status">
      <div class="uploading-spinner"></div>
      <span>正在上传文档，请稍候...</span>
    </div>
  </Dialog>

  <Toast ref="toastRef" :message="toastMsg" :type="toastType" :duration="1500" />
</template>

<style scoped>
.component3-container {
  background: rgba(249, 249, 249, 0.85);
  border-radius: 12px;
  padding: 24px;
  min-height: calc(100%);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.loading-state,
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  color: #888;
  font-size: 14px;
}

.empty-state {
  flex-direction: column;
  gap: 8px;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.title {
  font-size: 22px;
  font-weight: 700;
  color: #1a1a2e;
  font-family: 'Outfit', sans-serif;
  margin: 0;
}

.total-count {
  font-size: 14px;
  color: #666;
  background: rgba(102, 126, 234, 0.1);
  padding: 6px 14px;
  border-radius: 20px;
  font-weight: 500;
}

.add-collection-btn {
  padding: 12px 24px;
  background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
  border-radius: 10px;
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.3);
}

.add-collection-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(59, 130, 246, 0.4);
}

.collections-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  max-height: calc(100vh - 280px);
  overflow-y: auto;
  padding: 8px 8px;
}

.collection-card {
  background: #fff;
  border-radius: 14px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.06);
  transition: all 0.25s ease;
  display: flex;
  flex-direction: column;
  min-height: 180px;
  animation: cardIn 0.4s ease-out both;
}

.collection-card:hover {
  transform: translateY(-4px);
  z-index: 10;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.collection-title {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.collection-title .name {
  font-size: 17px;
  font-weight: 700;
  color: #1a1a2e;
  font-family: 'Outfit', sans-serif;
}

.collection-title .alias {
  font-size: 14px;
  color: #888;
  font-weight: 400;
}

.delete-icon {
  opacity: 0;
  color: #e74c3c;
  font-size: 22px;
  font-weight: 600;
  cursor: pointer;
  padding: 2px 8px;
  border-radius: 4px;
  transition: all 0.2s ease;
  line-height: 1;
}

.collection-card:hover .delete-icon {
  opacity: 1;
}

.delete-icon:hover {
  background: #fee;
  color: #c0392b;
}

.card-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.collection-desc {
  font-size: 13px;
  color: #666;
  line-height: 1.5;
}

.collection-meta {
  display: flex;
  gap: 6px;
  color: #888;
  font-size: 12px;
  flex-wrap: wrap;
}



.card-footer {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.btn-add-doc,
.btn-remove-doc {
  flex: 1;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.btn-add-doc {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.btn-add-doc:hover {
  background: rgba(59, 130, 246, 0.2);
}

.btn-remove-doc {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.btn-remove-doc:hover {
  background: rgba(239, 68, 68, 0.2);
}

.form-item {
  margin-bottom: 16px;
}

.form-item label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
}

.form-item input,
.form-item select,
.form-item textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 8px;
  font-size: 14px;
  color: #333;
  background: #fff;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  font-family: inherit;
  resize: vertical;
}

.form-item input:focus,
.form-item select:focus,
.form-item textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-item input::placeholder,
.form-item textarea::placeholder {
  color: #aaa;
}

.file-upload-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: 1px dashed rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  background: rgba(102, 126, 234, 0.04);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  color: #666;
}

.file-upload-btn:hover {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.08);
  color: #333;
}

.upload-icon {
  font-size: 16px;
}

.uploading-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 40px 0;
  color: #666;
  font-size: 14px;
}

.uploading-spinner {
  width: 36px;
  height: 36px;
  border: 3px solid rgba(102, 126, 234, 0.15);
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes cardIn {
  from {
    opacity: 0;
    transform: translateY(16px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.custom-select {
  position: relative;
  outline: none;
}

.select-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 10px 12px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 8px;
  font-size: 14px;
  color: #333;
  background: #fff;
  cursor: pointer;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  box-sizing: border-box;
}

.select-trigger:hover {
  border-color: #667eea;
}

.select-trigger .placeholder {
  color: #aaa;
}

.arrow {
  font-size: 12px;
  color: #888;
  transition: transform 0.2s ease;
}

.arrow.open {
  transform: rotate(180deg);
}

.select-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  z-index: 100;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 8px;
  max-height: 120px;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.option {
  padding: 10px 12px;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  transition: background 0.15s ease;
}

.option:hover {
  background: rgba(102, 126, 234, 0.08);
}

.option.active {
  color: #667eea;
  font-weight: 600;
  background: rgba(102, 126, 234, 0.06);
}

.option.disabled {
  color: #aaa;
  cursor: default;
}

.dropdown-enter-active {
  animation: dropdownIn 0.2s ease-out;
}

.dropdown-leave-active {
  animation: dropdownIn 0.15s ease-in reverse;
}

@keyframes dropdownIn {
  from {
    opacity: 0;
    transform: translateY(-8px) scale(0.97);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@media (max-width: 640px) {
  .collections-grid {
    grid-template-columns: 1fr;
  }
}

.footer-tips {
  font-size: 13px;
  color: #999;
  padding-top: 16px;
  border-top: 1px solid #eee;
  font-style: italic;
  margin-top: auto;
}
</style>