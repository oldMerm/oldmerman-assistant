<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { httpInstance, type Response } from '@/utils/http'
import Toast from '@/utils/toast/Toast.vue'
import Dialog from '@/utils/dialog/Dialog.vue'

interface VectorCollection {
  id?: number
  embedding_id?: number | null
  collection_name?: string | null
  collection_alias?: string | null
  collection_description?: string | null
  items_number?: number | null
  created_at?: string
}

interface VectorCollectionParam {
  embedding_id?: number | null
  collection_name?: string | null
  collection_alias?: string | null
  collection_description?: string | null
  items_number?: number | null
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
    return date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })
  } catch {
    return dateStr
  }
}

const fetchCollections = async () => {
  try {
    isLoading.value = true
    const res = await httpInstance.get<any, Response>('/vector_manage/render')
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
  items_number: 0
})
const addCollectionLoading = ref(false)

const openAddCollectionDialog = () => {
  addCollectionForm.value = {
    collection_name: '',
    collection_alias: '',
    collection_description: '',
    items_number: 0
  }
  addCollectionVisible.value = true
}

const onConfirmAddCollection = async () => {
  if (!addCollectionForm.value.collection_name) {
    showToast('请填写集合名称!')
    return
  }
  addCollectionLoading.value = true
  try {
    const res = await httpInstance.post<any, Response>('/vector_manage', addCollectionForm.value)
    if (res.code !== 200) {
      showToast(res.message || '添加集合失败!')
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

const onConfirmDeleteCollection = () => {
  deleteCollectionVisible.value = false
  pendingDeleteCollection.value = null
  showToast('删除功能暂未开放!')
}

const onAddDocument = () => {
  alert('功能未开放')
}

const onRemoveDocument = () => {
  alert('功能未开放')
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
        <div v-for="collection in collectionList" :key="collection.id" class="collection-card">
          <div class="card-header">
            <div class="collection-title">
              <span class="name">{{ collection.collection_name || '未命名' }}</span>
              <span class="alias" v-if="collection.collection_alias">({{ collection.collection_alias }})</span>
            </div>
            <span class="delete-icon" @click="openDeleteCollectionDialog(collection)">×</span>
          </div>
          <div class="card-body">
            <div class="collection-desc" v-if="collection.collection_description">{{ collection.collection_description }}</div>
            <div class="collection-meta">
              <span class="meta-item">📄 {{ collection.items_number ?? 0 }} 条文档</span>
              <span class="meta-item">📅 {{ formatDate(collection.created_at) }}</span>
            </div>
          </div>
          <div class="card-footer">
            <button class="btn-add-doc" @click="onAddDocument">添加文档</button>
            <button class="btn-remove-doc" @click="onRemoveDocument">撤销文档</button>
          </div>
        </div>
      </div>
      <div v-else class="empty-state">
        <p>暂无集合，点击右上角"添加集合"创建第一个知识库集合</p>
      </div>

      <div class="footer-tips">注：<br>1.集合名称不支持中文(3~512字符)<br>2.不要创建太多集合，建议按语言分类，或者文字图片分类等</div>
    </template>
  </div>

  <Dialog
    v-model:visible="addCollectionVisible"
    title="添加集合"
    :confirmLoading="addCollectionLoading"
    @confirm="onConfirmAddCollection"
    @cancel="addCollectionVisible = false"
  >
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
      <textarea v-model="addCollectionForm.collection_description" placeholder="请输入集合描述(选填)" rows="3"></textarea>
    </div>
  </Dialog>

  <Dialog
    v-model:visible="deleteCollectionVisible"
    title="确认删除"
    content="确定要删除该集合吗？此操作无法撤销。"
    @confirm="onConfirmDeleteCollection"
    @cancel="deleteCollectionVisible = false"
  />

  <Toast ref="toastRef" :message="toastMsg" :type="toastType" :duration="1500" />
</template>

<style scoped>
.component3-container {
  background: rgba(249, 249, 249, 0.85);
  border-radius: 12px;
  padding: 24px;
  margin: 16px;
  min-height: calc(100% - 32px);
}

.loading-state, .empty-state {
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
  gap: 16px;
  color: #888;
  font-size: 12px;
}



.card-footer {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.btn-add-doc, .btn-remove-doc {
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
  margin-top: 24px;
}
</style>