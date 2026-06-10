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

const totalText = computed(() => `共 ${totalDocs.value} 个文档`)
const pageInfoText = computed(() => `第 ${currentPage.value}/${totalPages.value} 页`)

const fetchDocuments = async (page: number) => {
  loading.value = true
  try {
    const res = await httpInstance.get<any, Response>('/document', {
      params: { current: page, size: pageSize.value }
    })
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

    <div class="doc-header">
      <div class="header-left">
        <h2 class="header-title">文档管理</h2>
        <span class="header-count">{{ totalText }}</span>
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
              <span class="meta-label">文件大小</span>
              <span class="meta-value">{{ formatSize(doc.filesize) }}</span>
            </div>
            <div class="meta-row">
              <span class="meta-label">所属集合</span>
              <span class="meta-value">{{ doc.collection_name }}</span>
            </div>
            <div class="meta-row">
              <span class="meta-label">分块数量</span>
              <span class="meta-value">{{ doc.doc_num }} 块</span>
            </div>
            <div class="meta-row">
              <span class="meta-label">创建时间</span>
              <span class="meta-value">{{ formatDate(doc.created_at) }}</span>
            </div>
          </div>
          <div class="card-actions">
            <button class="btn-delete" @click="confirmDelete(doc)">
              <span class="delete-icon">🗑</span>
              删除
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="doc-tips">
      <span class="tips-icon">ℹ</span>
      <span>文档被删除后不可恢复，请谨慎操作</span>
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
  margin-bottom: 20px;
}

.header-left {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.header-title {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: #1a1a2e;
}

.header-count {
  font-size: 13px;
  color: #888;
  font-weight: 400;
}

.doc-body {
  flex: 1;
  min-height: 0;
}

/* Loading & Empty */
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
  border: 3px solid rgba(102, 126, 234, 0.15);
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.empty-icon {
  font-size: 28px;
}

/* Grid: 4 columns × 2 rows = 8 cards */
.doc-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: 1fr 1fr;
  gap: 14px;
  height: 100%;
}

/* Card */
.doc-card {
  background: #fff;
  border-radius: 10px;
  padding: 12px 16px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.25s ease;
  display: flex;
  flex-direction: column;
  animation: cardIn 0.35s ease-out both;
  box-sizing: border-box;
  overflow: hidden;
}

.doc-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.09);
}

.card-top {
  margin-bottom: 6px;
  padding-bottom: 6px;
  border-bottom: 1px solid #f0f0f0;
}

.card-filename {
  position: relative;
  font-size: 15px;
  font-weight: 700;
  color: #1a1a2e;
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
  color: #555;
  background: #fff;
  padding: 4px 8px;
  border-radius: 5px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.06);
  white-space: nowrap;
  max-width: 280px;
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
  gap: 3px;
  justify-content: flex-start;
}

.meta-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.meta-label {
  font-size: 12px;
  color: #999;
  min-width: 30px;
  font-weight: 500;
}

.meta-value {
  font-size: 13px;
  color: #333;
  font-weight: 400;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-actions {
  padding-top: 6px;
  border-top: 1px solid #f0f0f0;
  margin-top: auto;
}

.btn-delete {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  border: none;
  background: rgba(239, 68, 68, 0.08);
  color: #ef4444;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-delete:hover {
  background: rgba(239, 68, 68, 0.16);
}

.delete-icon {
  font-size: 11px;
}

/* Tips */
.doc-tips {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 0 2px;
  font-size: 11px;
  color: #999;
}

.tips-icon {
  font-size: 12px;
  opacity: 0.7;
}

/* Footer / Pagination */
.doc-footer {
  flex-shrink: 0;
  padding: 8px 0 4px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
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
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 6px;
  background: #fff;
  color: #333;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-btn:hover:not(:disabled):not(.active) {
  border-color: #667eea;
  color: #667eea;
  background: rgba(102, 126, 234, 0.04);
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

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
