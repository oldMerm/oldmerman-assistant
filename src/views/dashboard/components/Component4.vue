<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { httpInstance, type Response } from '@/utils/http'
import Toast from '@/utils/toast/Toast.vue'
import Dialog from '@/utils/dialog/Dialog.vue'

interface DocumentItem {
  id: string
  filename: string
  filesize: number
  collection_name: string
  created_at: string
  doc_num: number
}

interface PageData {
  current: number
  size: number
  total: number
  page_num: number
  data: DocumentItem[] | null
}

const toastRef = ref()
const toastMsg = ref('')
const toastType = ref<'success' | 'error'>('success')

const documents = ref<DocumentItem[]>([])
const currentPage = ref(1)
const pageSize = ref(10)
const totalDocs = ref(0)
const totalPages = ref(0)
const loading = ref(false)

const deleteDialogVisible = ref(false)
const deletingDoc = ref<DocumentItem | null>(null)
const deleting = ref(false)

const collections = ref<string[]>([])
const selectedCollection = ref('')
const showCollectionDropdown = ref(false)
const loadingCollections = ref(false)

const totalText = computed(() => `共 ${totalDocs.value} 个文档`)
const pageInfoText = computed(() => `第 ${currentPage.value}/${totalPages.value} 页`)

const fetchDocuments = async (page: number, collectionName?: string) => {
  loading.value = true
  try {
    const params: Record<string, any> = { current: page, size: pageSize.value }
    if (collectionName || selectedCollection.value) {
      params.collection_name = collectionName || selectedCollection.value
    }
    const res = await httpInstance.get<any, Response>('/document', { params })
    if (res.code !== 200) {
      showToast('error', res.message || '获取文档列表失败')
      return
    }
    const pageData = res.data as PageData
    documents.value = pageData.data || []
    totalDocs.value = pageData.total
    totalPages.value = pageData.page_num
    currentPage.value = pageData.current
  } catch (error) {
    showToast('error', `获取文档列表失败: ${error}`)
  } finally {
    loading.value = false
  }
}

const fetchCollections = async () => {
  loadingCollections.value = true
  try {
    const res = await httpInstance.get<any, Response>('/vector-manage/list')
    if (res.code === 200) {
      collections.value = res.data || []
    }
  } catch {
    // silently fail
  } finally {
    loadingCollections.value = false
  }
}

const selectCollection = (name: string) => {
  showCollectionDropdown.value = false
  selectedCollection.value = name
  fetchDocuments(1, name)
}

const clearCollection = () => {
  selectedCollection.value = ''
  fetchDocuments(1)
}

const showToast = (type: 'success' | 'error', msg: string) => {
  toastType.value = type
  toastMsg.value = msg
  toastRef.value?.show()
}

const confirmDelete = (doc: DocumentItem) => {
  deletingDoc.value = doc
  deleteDialogVisible.value = true
}

const doDelete = async () => {
  if (!deletingDoc.value) return
  deleting.value = true
  try {
    const res = await httpInstance.delete<any, Response>('/document', {
      params: { doc_id: deletingDoc.value.id }
    })
    if (res.code !== 200) {
      showToast('error', res.message || '删除失败')
      return
    }
    showToast('success', '删除成功')
    deleteDialogVisible.value = false
    if (documents.value.length === 1 && currentPage.value > 1) {
      fetchDocuments(currentPage.value - 1)
    } else {
      fetchDocuments(currentPage.value)
    }
  } catch (error) {
    showToast('error', `删除失败: ${error}`)
  } finally {
    deleting.value = false
    deletingDoc.value = null
  }
}

const cancelDelete = () => {
  deleteDialogVisible.value = false
  deletingDoc.value = null
}

const goToPage = (page: number) => {
  if (page < 1 || page > totalPages.value || page === currentPage.value) return
  fetchDocuments(page)
}

interface RerankModel {
  model_id: number
  model_name: string
  model_group_name?: string
}

const rerankEnabled = ref(false)
const rerankModelName = ref('')
const rerankLoading = ref(false)
const rerankModels = ref<RerankModel[]>([])
const showRerankDialog = ref(false)
const rerankDialogMode = ref<'select-model' | 'confirm-enable' | 'confirm-disable'>('select-model')
const selectedRerankModel = ref<RerankModel | null>(null)
const rerankConfirming = ref(false)

const fetchRerankStatus = async () => {
  try {
    const res = await httpInstance.get<any, Response>('/system_config/rerank')
    if (res.code === 200 && res.data) {
      rerankEnabled.value = !!res.data['rerank.enabled']
      rerankModelName.value = rerankEnabled.value ? (res.data.model || '') : ''
    }
  } catch {
    // silently fail
  }
}

const fetchRerankModels = async () => {
  try {
    const res = await httpInstance.get<any, Response>('/model_type/vector-models', {
      params: { type_name: '重排序模型' }
    })
    if (res.code === 200 && res.data?.models) {
      rerankModels.value = res.data.models
    }
  } catch {
    rerankModels.value = []
  }
}

const onRerankClick = async () => {
  if (rerankEnabled.value) {
    rerankDialogMode.value = 'confirm-disable'
    showRerankDialog.value = true
  } else {
    rerankDialogMode.value = 'select-model'
    showRerankDialog.value = true
    await fetchRerankModels()
  }
}

const onRerankModelSelect = (model: RerankModel) => {
  selectedRerankModel.value = model
  rerankDialogMode.value = 'confirm-enable'
}

const onRerankConfirm = async () => {
  rerankConfirming.value = true
  try {
    if (rerankDialogMode.value === 'confirm-enable') {
      if (!selectedRerankModel.value) return
      const res = await httpInstance.post<any, Response>('/system_config/rerank', {
        model_id: selectedRerankModel.value.model_id,
        is_enabled: true
      })
      if (res.code !== 200) {
        showToast('error', res.message || '开启重排序失败')
        return
      }
      showToast('success', '重排序已开启')
      rerankEnabled.value = true
      rerankModelName.value = selectedRerankModel.value.model_name
    } else if (rerankDialogMode.value === 'confirm-disable') {
      const res = await httpInstance.post<any, Response>('/system_config/rerank', {
        is_enabled: false,
        model_id: null
      })
      if (res.code !== 200) {
        showToast('error', res.message || '关闭重排序失败')
        return
      }
      showToast('success', '重排序已关闭')
      rerankEnabled.value = false
      rerankModelName.value = ''
    }
    showRerankDialog.value = false
  } catch (error) {
    showToast('error', `操作失败: ${error}`)
  } finally {
    rerankConfirming.value = false
  }
}

const onRerankCancel = () => {
  showRerankDialog.value = false
  selectedRerankModel.value = null
  rerankModels.value = []
}

const formatSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const formatDate = (dateStr: string): string => {
  const d = new Date(dateStr)
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const pageNumbers = computed(() => {
  const pages: (number | string)[] = []
  const total = totalPages.value
  const current = currentPage.value

  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i)
    return pages
  }

  pages.push(1)
  if (current > 3) pages.push('...')

  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  for (let i = start; i <= end; i++) pages.push(i)

  if (current < total - 2) pages.push('...')
  pages.push(total)

  return pages
})

onMounted(() => {
  fetchDocuments(1)
  fetchCollections()
  fetchRerankStatus()
})
</script>

<template>
  <div class="doc-manager">
    <Toast ref="toastRef" :message="toastMsg" :type="toastType" :duration="1500" />
    <Dialog
      v-model:visible="deleteDialogVisible"
      title="确认删除"
      :content="deletingDoc ? `确定要删除「${deletingDoc.filename}」吗？此操作不可撤销。` : ''"
      @confirm="doDelete"
      @cancel="cancelDelete"
      :confirm-loading="deleting"
    />

    <Dialog
      v-model:visible="showRerankDialog"
      :title="rerankDialogMode === 'confirm-disable' ? '关闭重排序' : rerankDialogMode === 'confirm-enable' ? '开启重排序' : '选择重排序模型'"
      @confirm="onRerankConfirm"
      @cancel="onRerankCancel"
      :confirm-loading="rerankConfirming"
    >
      <template v-if="rerankDialogMode === 'select-model'">
        <div class="rerank-model-list">
          <div
            v-for="model in rerankModels"
            :key="model.model_id"
            class="rerank-model-item"
            :class="{ selected: selectedRerankModel?.model_id === model.model_id }"
            @click="onRerankModelSelect(model)"
          >
            <span class="model-name">{{ model.model_name }}</span>
            <span v-if="model.model_group_name" class="model-group">{{ model.model_group_name }}</span>
          </div>
          <div v-if="rerankModels.length === 0" class="rerank-model-empty">
            <span>暂无可选模型</span>
          </div>
        </div>
      </template>
      <template v-else-if="rerankDialogMode === 'confirm-enable'">
        <p class="rerank-confirm-text">确定使用「{{ selectedRerankModel?.model_name }}」模型开启文档重排序吗？</p>
      </template>
      <template v-else>
        <p class="rerank-confirm-text">确定要关闭文档重排序功能吗？</p>
      </template>
    </Dialog>

    <div class="doc-header">
      <div class="header-left">
        <h2 class="header-title">文档管理</h2>
        <span class="header-count">{{ totalText }}</span>
      </div>
      <div class="header-right">
        <button class="rerank-btn" @click="onRerankClick">
          <span class="rerank-label">文档重排序</span>
          <span class="rerank-value">{{ rerankEnabled && rerankModelName ? rerankModelName : '未开启' }}</span>
        </button>
      </div>
    </div>

    <div class="filter-bar">
      <div class="filter-group">
        <span class="filter-label">集合筛选</span>
        <div class="collection-select" @click="showCollectionDropdown = !showCollectionDropdown">
          <span class="select-trigger">
            <span v-if="selectedCollection" class="select-value">{{ selectedCollection }}</span>
            <span v-else class="select-placeholder">全部集合</span>
          </span>
          <span class="select-arrow" :class="{ open: showCollectionDropdown }">▼</span>
        </div>
        <Transition name="dropdown">
          <div v-if="showCollectionDropdown" class="collection-dropdown">
            <div
              class="dropdown-item"
              :class="{ active: !selectedCollection }"
              @click="clearCollection"
            >
              全部集合
            </div>
            <div
              v-for="name in collections"
              :key="name"
              class="dropdown-item"
              :class="{ active: selectedCollection === name }"
              @click="selectCollection(name)"
            >
              {{ name }}
            </div>
            <div v-if="loadingCollections" class="dropdown-loading">加载中...</div>
          </div>
        </Transition>
      </div>
      <div class="filter-reserved">
        <span class="reserved-hint">更多筛选条件</span>
      </div>
    </div>

    <div class="doc-body">
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <span>加载中...</span>
      </div>
      <div v-else-if="documents.length === 0" class="empty-state">
        <span class="empty-icon">📄</span>
        <span>暂无文档</span>
      </div>
      <div v-else class="doc-grid" :key="currentPage">
        <div
          v-for="(doc, index) in documents"
          :key="doc.id"
          class="doc-card"
          :style="{ animationDelay: `${index * 0.06}s` }"
        >
          <div class="card-top">
            <div class="card-filename">
              <span class="filename-text">{{ doc.filename }}</span>
              <span class="filename-hover">{{ doc.filename }}</span>
            </div>
          </div>
          <div class="card-meta">
            <div class="meta-row">
              <span class="meta-label">大小</span>
              <span class="meta-value">{{ formatSize(doc.filesize) }}</span>
            </div>
            <div class="meta-row">
              <span class="meta-label">集合</span>
              <span class="meta-value">{{ doc.collection_name }}</span>
            </div>
            <div class="meta-row">
              <span class="meta-label">分块</span>
              <span class="meta-value">{{ doc.doc_num }} 块</span>
            </div>
            <div class="meta-row">
              <span class="meta-label">时间</span>
              <span class="meta-value">{{ formatDate(doc.created_at) }}</span>
            </div>
          </div>
          <div class="card-actions">
            <button class="btn-delete" @click="confirmDelete(doc)">删除</button>
          </div>
        </div>
      </div>
    </div>

    <div class="footer-tips">
      文档被删除后不可恢复，请谨慎操作
    </div>

    <div class="doc-footer">
      <div class="footer-left">
        <span class="page-info">{{ pageInfoText }}</span>
      </div>
      <div class="pagination">
        <button
          class="page-btn"
          :disabled="currentPage <= 1"
          @click="goToPage(currentPage - 1)"
        >
          ‹
        </button>
        <template v-for="p in pageNumbers" :key="p">
          <span v-if="p === '...'" class="page-ellipsis">...</span>
          <button
            v-else
            :class="['page-btn', { active: p === currentPage }]"
            @click="goToPage(p as number)"
          >
            {{ p }}
          </button>
        </template>
        <button
          class="page-btn"
          :disabled="currentPage >= totalPages"
          @click="goToPage(currentPage + 1)"
        >
          ›
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.doc-manager {
  background: rgba(249, 249, 249, 0.85);
  border-radius: 12px;
  padding: 18px 24px 10px;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.doc-header {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.header-left {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.header-title {
  margin: 0;
  font-family: 'Outfit', sans-serif;
  font-size: 22px;
  font-weight: 700;
  color: #1a1a2e;
  letter-spacing: -0.3px;
}

.header-count {
  font-size: 13px;
  color: #888;
  font-weight: 400;
}

.header-right {
  display: flex;
  align-items: center;
}

.rerank-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: 6px 16px;
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 8px;
  background: linear-gradient(135deg, #f0f7ff 0%, #e8f0fe 100%);
  cursor: pointer;
  transition: all 0.25s ease;
  user-select: none;
  font-family: inherit;
  line-height: 1.2;
}

.rerank-btn:hover {
  border-color: rgba(59, 130, 246, 0.4);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);
  transform: translateY(-1px);
}

.rerank-label {
  font-size: 12px;
  font-weight: 600;
  color: #1e3a5f;
  white-space: nowrap;
}

.rerank-value {
  font-size: 11px;
  color: #64748b;
  font-weight: 500;
}

/* Filter Bar */
.filter-bar {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
  padding-bottom: 14px;
  border-bottom: 1px solid rgba(59, 130, 246, 0.08);
}

.filter-group {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-label {
  font-size: 13px;
  font-weight: 500;
  color: #64748b;
  white-space: nowrap;
}

.collection-select {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 7px 12px;
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 8px;
  font-size: 13px;
  color: #333;
  background: #fff;
  cursor: pointer;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  min-width: 140px;
  user-select: none;
}

.collection-select:hover {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.06);
}

.select-trigger {
  display: flex;
  align-items: center;
  gap: 6px;
}

.select-value {
  color: #2563eb;
  font-weight: 500;
}

.select-placeholder {
  color: #94a3b8;
}

.select-arrow {
  font-size: 10px;
  color: #94a3b8;
  transition: transform 0.2s ease;
}

.select-arrow.open {
  transform: rotate(180deg);
}

.collection-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 52px;
  z-index: 100;
  background: #fff;
  border: 1px solid rgba(59, 130, 246, 0.15);
  border-radius: 8px;
  min-width: 160px;
  max-height: 200px;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(59, 130, 246, 0.12);
  animation: dropdownIn 0.2s ease-out;
}

.dropdown-item {
  padding: 9px 14px;
  font-size: 13px;
  color: #333;
  cursor: pointer;
  transition: background 0.15s ease;
}

.dropdown-item:hover {
  background: rgba(59, 130, 246, 0.06);
}

.dropdown-item.active {
  color: #2563eb;
  font-weight: 600;
  background: rgba(59, 130, 246, 0.08);
}

.dropdown-loading {
  padding: 9px 14px;
  font-size: 13px;
  color: #94a3b8;
}

/* Reserved space for future filters */
.filter-reserved {
  flex: 1;
  display: flex;
  align-items: center;
  min-height: 34px;
}

.reserved-hint {
  font-size: 12px;
  color: #cbd5e1;
  font-style: italic;
  letter-spacing: 0.3px;
}

/* Body */
.doc-body {
  flex: 1;
  min-height: 0;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100%;
  color: #888;
  font-size: 14px;
  gap: 12px;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(59, 130, 246, 0.12);
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.empty-icon {
  font-size: 28px;
}

/* Grid: 5 columns × 2 rows = 10 cards */
.doc-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-template-rows: 1fr 1fr;
  gap: 12px;
  height: 100%;
}

/* Card - Light Blue Theme */
.doc-card {
  background: linear-gradient(135deg, #f8fbff 0%, #f0f7fe 100%);
  border-radius: 10px;
  padding: 10px 13px;
  border: 1px solid rgba(59, 130, 246, 0.1);
  box-shadow: 0 1px 4px rgba(59, 130, 246, 0.06);
  transition: all 0.25s ease;
  display: flex;
  flex-direction: column;
  animation: cardIn 0.35s ease-out both;
  box-sizing: border-box;
  overflow: hidden;
}

.doc-card:hover {
  transform: translateY(-3px);
  border-color: rgba(59, 130, 246, 0.25);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.1);
}

.card-top {
  margin-bottom: 5px;
  padding-bottom: 5px;
  border-bottom: 1px solid rgba(59, 130, 246, 0.08);
}

.card-filename {
  position: relative;
  font-size: 14px;
  font-weight: 700;
  color: #1e3a5f;
  line-height: 1.3;
}

.filename-text {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.filename-hover {
  display: none;
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  z-index: 10;
  font-size: 12px;
  font-weight: 400;
  color: #475569;
  background: #fff;
  padding: 4px 8px;
  border-radius: 5px;
  box-shadow: 0 2px 10px rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.1);
  white-space: nowrap;
  max-width: 260px;
  overflow: hidden;
  text-overflow: ellipsis;
  pointer-events: none;
}

.card-filename:hover .filename-hover {
  display: block;
}

.card-meta {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  justify-content: flex-start;
}

.meta-row {
  display: flex;
  align-items: center;
  gap: 4px;
}

.meta-label {
  font-size: 11px;
  color: #94a3b8;
  min-width: 24px;
  font-weight: 500;
  flex-shrink: 0;
}

.meta-value {
  font-size: 12px;
  color: #334155;
  font-weight: 400;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-actions {
  padding-top: 5px;
  border-top: 1px solid rgba(59, 130, 246, 0.08);
  margin-top: auto;
}

.btn-delete {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  border: none;
  background: rgba(239, 68, 68, 0.06);
  color: #ef4444;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-delete:hover {
  background: rgba(239, 68, 68, 0.14);
}

/* Tips */
.footer-tips {
  font-size: 13px;
  color: #999;
  padding-top: 14px;
  font-style: italic;
  margin-top: auto;
}

/* Footer / Pagination */
.doc-footer {
  flex-shrink: 0;
  padding: 8px 0 4px;
  border-top: 1px solid rgba(59, 130, 246, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.footer-left {
  display: flex;
  align-items: center;
}

.page-info {
  font-size: 13px;
  color: #888;
}

.pagination {
  display: flex;
  align-items: center;
  gap: 3px;
}

.page-btn {
  min-width: 30px;
  height: 30px;
  padding: 0 8px;
  border: 1px solid rgba(59, 130, 246, 0.12);
  border-radius: 6px;
  background: #fff;
  color: #475569;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-btn:hover:not(:disabled):not(.active) {
  border-color: #3b82f6;
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.04);
}

.page-btn.active {
  background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
  color: #fff;
  border-color: transparent;
  box-shadow: 0 2px 6px rgba(59, 130, 246, 0.3);
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-ellipsis {
  min-width: 30px;
  text-align: center;
  color: #888;
  font-size: 12px;
}

/* Animations */
@keyframes cardIn {
  from {
    opacity: 0;
    transform: translateY(12px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes dropdownIn {
  from {
    opacity: 0;
    transform: translateY(-6px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Rerank Model List */
.rerank-model-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 240px;
  overflow-y: auto;
}

.rerank-model-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid rgba(59, 130, 246, 0.1);
  cursor: pointer;
  transition: all 0.2s ease;
  background: #fff;
}

.rerank-model-item:hover {
  background: rgba(59, 130, 246, 0.04);
  border-color: rgba(59, 130, 246, 0.25);
}

.rerank-model-item.selected {
  background: rgba(59, 130, 246, 0.06);
  border-color: #3b82f6;
}

.model-name {
  font-size: 14px;
  font-weight: 600;
  color: #1e3a5f;
}

.model-group {
  font-size: 12px;
  color: #94a3b8;
}

.rerank-model-empty {
  text-align: center;
  padding: 20px;
  color: #94a3b8;
  font-size: 14px;
}

.rerank-confirm-text {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: #4a5568;
}

/* Dropdown transition */
.dropdown-enter-active {
  animation: dropdownIn 0.2s ease-out;
}
.dropdown-leave-active {
  animation: dropdownIn 0.15s ease-in reverse;
}
</style>
