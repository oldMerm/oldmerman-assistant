<template>
  <Teleport to="body">
    <Transition name="panel">
      <div v-if="localVisible" class="panel-wrapper">
        <div class="chat-panel" @click.stop>
          <header class="chat-header">
            <div class="header-left">
              <button class="header-btn model-btn" @click.stop="toggleModelDropdown">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
                <span class="model-name">{{ selectedModel?.model_name || '选择模型' }}</span>
                <svg class="chevron" :class="{ open: showModelDropdown }" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
                <Transition name="dropdown">
                  <div v-if="showModelDropdown" class="model-dropdown" @click.stop>
                    <template v-for="group in modelGroups" :key="group.type_id">
                      <div class="model-group-header">{{ group.type_name }}</div>
                      <div
                        v-for="m in group.models"
                        :key="m.model_id"
                        class="model-item"
                        :class="{ active: selectedModel?.model_id === m.model_id }"
                        @click="selectModel(m)"
                      >
                        <span class="item-name">{{ m.model_name }}</span>
                      </div>
                    </template>
                    <div v-if="modelGroups.length === 0" class="model-empty">暂无可用模型</div>
                  </div>
                </Transition>
              </button>
            </div>
            <div class="header-right">
              <button class="header-btn" :class="{ spinning: refreshSpinning }" @click="refresh" title="清空会话">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="23 4 23 10 17 10" />
                  <polyline points="1 20 1 14 7 14" />
                  <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
                </svg>
              </button>
              <button class="header-btn" :class="{ spinning: closeSpinning }" @click="hide" title="关闭">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </header>

          <div ref="chatContainer" class="chat-body">
            <div v-if="messages.length === 0" class="chat-empty">
              <div class="empty-watermark">向老鱼人知识库提问</div>
            </div>
            <div v-else class="messages-list">
              <div
                v-for="(msg, idx) in messages"
                :key="idx"
                :class="['message', msg.role]"
              >
                <div class="message-avatar">
                  <svg v-if="msg.role === 'user'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5" />
                    <path d="M2 12l10 5 10-5" />
                  </svg>
                </div>
                <div class="message-content">
                  <div v-if="msg.role === 'user'" class="content-text">{{ msg.content }}</div>
                  <div v-else class="content-markdown" v-html="mdToHtml(msg.content)"></div>
                </div>
              </div>
              <div v-if="isLoading" class="message ai">
                <div class="message-avatar">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5" />
                    <path d="M2 12l10 5 10-5" />
                  </svg>
                </div>
                <div class="message-content">
                  <span class="typing-dots"><span>.</span><span>.</span><span>.</span></span>
                </div>
              </div>
            </div>
          </div>

          <footer class="chat-footer">
            <div class="input-wrapper">
              <input
                v-model="input"
                class="chat-input"
                placeholder="开始一段新的对话"
                @keydown="handleKeydown"
                :disabled="isLoading"
              />
              <button class="send-btn" :disabled="!input.trim() || isLoading" @click="sendMessage">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { httpInstance, API_BASE_URL } from '@/utils/http'
import type { Response } from '@/utils/http'

interface ModelItem {
  model_id: number
  model_name: string
}

interface ModelGroup {
  type_id: number
  type_name: string
  models: ModelItem[]
}

interface Props {
  visible?: boolean
  collectionName?: string
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  collectionName: 'text_collection',
})

const emit = defineEmits<{
  'update:visible': [value: boolean]
}>()

const localVisible = ref(props.visible)
const input = ref('')
const messages = ref<{ role: 'user' | 'ai', content: string }[]>([])
const isLoading = ref(false)
const modelGroups = ref<ModelGroup[]>([])
const selectedModel = ref<ModelItem | null>(null)
const showModelDropdown = ref(false)
const chatContainer = ref<HTMLElement | null>(null)
const abortController = ref<AbortController | null>(null)
const refreshSpinning = ref(false)
const closeSpinning = ref(false)

watch(() => props.visible, (val) => {
  localVisible.value = val
  if (val) {
    fetchModels()
  }
})

watch(localVisible, (val) => {
  emit('update:visible', val)
})

const show = () => {
  localVisible.value = true
  fetchModels()
}
const hide = () => {
  showModelDropdown.value = false
  localVisible.value = false
}

defineExpose({ show, hide })

const toggleModelDropdown = () => {
  showModelDropdown.value = !showModelDropdown.value
  if (showModelDropdown.value) {
    fetchModels()
  }
}

const fetchModels = async () => {
  try {
    const res = await httpInstance.get<any, Response>('/model_type/vector-models', {
      params: { type_name: '快速响应模型' },
    })
    if (res.code === 200 && res.data) {
      const group = res.data as ModelGroup
      modelGroups.value = [group]
      if (!selectedModel.value && group.models?.length > 0) {
        selectedModel.value = group.models[0]!
      }
    }
  } catch {
    console.error('Failed to fetch models')
  }
}

const selectModel = (model: ModelItem) => {
  selectedModel.value = model
  showModelDropdown.value = false
}

const scrollToBottom = async () => {
  await nextTick()
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
}

const sendMessage = async () => {
  const text = input.value.trim()
  if (!text || isLoading.value) return

  messages.value.push({ role: 'user', content: text })
  input.value = ''
  await scrollToBottom()

  isLoading.value = true
  const aiIndex = messages.value.length
  messages.value.push({ role: 'ai', content: '' })

  abortController.value = new AbortController()

  try {
    const body: Record<string, string> = {
      user_prompt: text,
      collection_name: props.collectionName,
    }
    if (selectedModel.value) {
      body.model_id = String(selectedModel.value.model_id)
    }

    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: abortController.value.signal,
    })

    if (!response.body) throw new Error('No response body')

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const rawLine of lines) {
        const line = rawLine!
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6))
            if (data.type === 'content') {
              messages.value[aiIndex]!.content += data.chunk
              scrollToBottom()
            } else if (data.type === 'end') {
              isLoading.value = false
            }
          } catch {
            // skip malformed data
          }
        }
      }
    }
  } catch (error: unknown) {
    if (error instanceof Error && error.name !== 'AbortError') {
      console.error('Chat error:', error)
      messages.value[aiIndex]!.content = '抱歉，请求失败，请检查网络后重试。'
    }
  } finally {
    isLoading.value = false
    abortController.value = null
  }
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    sendMessage()
  }
}

const refresh = () => {
  refreshSpinning.value = true
  messages.value = []
  setTimeout(() => {
    refreshSpinning.value = false
  }, 600)
}

function mdToHtml(text: string): string {
  const lines = text.split('\n')
  const result: string[] = []
  let inCodeBlock = false
  let inParagraph = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!
    if (line === undefined) continue

    const trimmed = line.trim()

    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        result.push('</code></pre>')
        inCodeBlock = false
      } else {
        if (inParagraph) {
          result.push('</p>')
          inParagraph = false
        }
        const lang = trimmed.slice(3).trim()
        result.push(`<pre><code${lang ? ` class="language-${lang}"` : ''}>`)
        inCodeBlock = true
      }
      continue
    }

    if (inCodeBlock) {
      result.push(line + '\n')
      continue
    }

    let processed = line
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')

    if (trimmed === '') {
      if (inParagraph) {
        result.push('</p>')
        inParagraph = false
      }
    } else if (trimmed.startsWith('### ')) {
      if (inParagraph) { result.push('</p>'); inParagraph = false }
      result.push(`<h3>${escapeHtml(trimmed.slice(4))}</h3>`)
    } else if (trimmed.startsWith('## ')) {
      if (inParagraph) { result.push('</p>'); inParagraph = false }
      result.push(`<h2>${escapeHtml(trimmed.slice(3))}</h2>`)
    } else if (trimmed.startsWith('# ')) {
      if (inParagraph) { result.push('</p>'); inParagraph = false }
      result.push(`<h1>${escapeHtml(trimmed.slice(2))}</h1>`)
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      if (inParagraph) { result.push('</p>'); inParagraph = false }
      result.push(`<li>${processed.slice(2)}</li>`)
    } else if (/^\d+\.\s/.test(trimmed)) {
      if (inParagraph) { result.push('</p>'); inParagraph = false }
      result.push(`<li>${processed.replace(/^\d+\.\s*/, '')}</li>`)
    } else {
      if (!inParagraph) {
        result.push('<p>')
        inParagraph = true
      } else {
        result.push('<br>')
      }
      result.push(processed)
    }
  }

  if (inCodeBlock) result.push('</code></pre>')
  if (inParagraph) result.push('</p>')

  return result.join('')
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}
</script>

<style scoped>
.panel-wrapper {
  position: fixed;
  inset: 0;
  z-index: 999;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  background: rgba(0, 0, 0, 0.12);
}

.chat-panel {
  width: calc(100vw / 3.75);
  height: 73vh;
  min-width: 360px;
  max-width: 480px;
  background: #ffffff;
  box-shadow: -4px 0 24px rgba(59, 130, 246, 0.12);
  display: flex;
  flex-direction: column;
  border-radius: 12px 0 0 12px;
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid rgba(59, 130, 246, 0.08);
  flex-shrink: 0;
  border-radius: 12px 0 0 0;
  position: relative;
  z-index: 1;
}

.header-left,
.header-right {
  display: flex;
  align-items: center;
  gap: 4px;
}

.header-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border: none;
  background: transparent;
  color: #94a3b8;
  cursor: pointer;
  border-radius: 6px;
  transition: color 0.2s;
  font-size: 13px;
  position: relative;
}

.header-btn:hover {
  color: #3b82f6;
}

.header-btn.spinning {
  animation: spin-once 0.6s ease-in-out;
}

.model-btn {
  padding: 6px 10px;
}

.model-name {
  font-size: 13px;
  font-weight: 500;
  color: inherit;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chevron {
  transition: transform 0.2s;
}

.chevron.open {
  transform: rotate(180deg);
}

.model-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 4px;
  background: #ffffff;
  border: 1px solid rgba(59, 130, 246, 0.12);
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  min-width: 200px;
  max-height: 240px;
  overflow-y: auto;
  z-index: 100;
}

.model-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  cursor: pointer;
  transition: background 0.15s;
  gap: 16px;
}

.model-item:hover {
  background: rgba(59, 130, 246, 0.06);
}

.model-item.active {
  background: rgba(59, 130, 246, 0.08);
}

.item-name {
  font-size: 13px;
  font-weight: 500;
  color: #334155;
}

.item-type {
  font-size: 11px;
  color: #94a3b8;
  white-space: nowrap;
}

.model-group-header {
  padding: 8px 14px 4px;
  font-size: 11px;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.model-group-header:not(:first-child) {
  margin-top: 4px;
  border-top: 1px solid rgba(59, 130, 246, 0.06);
}

.model-empty {
  padding: 14px;
  text-align: center;
  color: #94a3b8;
  font-size: 13px;
}

.chat-body {
  flex: 1;
  overflow-y: auto;
  position: relative;
  background: linear-gradient(180deg, #f8faff 0%, #f0f7fc 100%);
}

.chat-body::-webkit-scrollbar {
  width: 4px;
}

.chat-body::-webkit-scrollbar-track {
  background: transparent;
}

.chat-body::-webkit-scrollbar-thumb {
  background: rgba(59, 130, 246, 0.15);
  border-radius: 2px;
}

.chat-empty {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  user-select: none;
  pointer-events: none;
}

.empty-watermark {
  font-size: 18px;
  font-weight: 500;
  color: rgba(59, 130, 246, 0.12);
  letter-spacing: 2px;
}

.messages-list {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message {
  display: flex;
  gap: 10px;
  max-width: 100%;
}

.message.user {
  flex-direction: row-reverse;
}

.message-avatar {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
}

.message.user .message-avatar {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.message.ai .message-avatar {
  background: rgba(100, 116, 139, 0.08);
  color: #64748b;
}

.message-content {
  max-width: 80%;
}

.message.user .message-content {
  background: rgba(59, 130, 246, 0.08);
  padding: 10px 14px;
  border-radius: 12px 4px 12px 12px;
}

.message.ai .message-content {
  padding: 2px 0;
}

.content-text {
  font-size: 14px;
  line-height: 1.6;
  color: #334155;
  word-break: break-word;
  white-space: pre-wrap;
}

.content-markdown {
  font-size: 14px;
  line-height: 1.7;
  color: #475569;
  word-break: break-word;
}

.content-markdown :deep(p) {
  margin: 0 0 8px;
}

.content-markdown :deep(p:last-child) {
  margin-bottom: 0;
}

.content-markdown :deep(br) {
  display: block;
  content: '';
  margin: 4px 0;
}

.content-markdown :deep(strong) {
  font-weight: 600;
  color: #1e293b;
}

.content-markdown :deep(em) {
  font-style: italic;
}

.content-markdown :deep(code) {
  font-family: 'Cascadia Code', 'Fira Code', 'Consolas', monospace;
  font-size: 13px;
  background: rgba(59, 130, 246, 0.06);
  padding: 2px 6px;
  border-radius: 4px;
  color: #2563eb;
}

.content-markdown :deep(pre) {
  background: #1e293b;
  border-radius: 8px;
  padding: 14px;
  overflow-x: auto;
  margin: 8px 0;
}

.content-markdown :deep(pre code) {
  background: none;
  padding: 0;
  color: #e2e8f0;
  font-size: 13px;
  line-height: 1.6;
}

.content-markdown :deep(h1),
.content-markdown :deep(h2),
.content-markdown :deep(h3) {
  color: #1e293b;
  margin: 12px 0 6px;
  font-weight: 600;
}

.content-markdown :deep(h1) { font-size: 17px; }
.content-markdown :deep(h2) { font-size: 16px; }
.content-markdown :deep(h3) { font-size: 15px; }

.content-markdown :deep(li) {
  position: relative;
  padding-left: 20px;
  margin-bottom: 4px;
  list-style: none;
}

.content-markdown :deep(li)::before {
  content: '•';
  position: absolute;
  left: 6px;
  color: #3b82f6;
}

.content-markdown :deep(a) {
  color: #3b82f6;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.content-markdown :deep(a:hover) {
  color: #2563eb;
}

.typing-dots span {
  display: inline-block;
  animation: dot-bounce 1.4s infinite;
  font-size: 24px;
  line-height: 1;
  color: #94a3b8;
}

.typing-dots span:nth-child(2) { animation-delay: 0.2s; }
.typing-dots span:nth-child(3) { animation-delay: 0.4s; }

@keyframes dot-bounce {
  0%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-6px); }
}

.chat-footer {
  flex-shrink: 0;
  padding: 10px 16px;
  border-top: 1px solid rgba(59, 130, 246, 0.08);
  background: #ffffff;
  border-radius: 0 0 0 12px;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
}

.chat-input {
  flex: 1;
  border: 1px solid rgba(59, 130, 246, 0.12);
  border-radius: 10px;
  padding: 10px 14px;
  font-size: 14px;
  line-height: 1.5;
  color: #334155;
  background: #f8faff;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  font-family: inherit;
}

.chat-input::placeholder {
  color: #94a3b8;
  font-size: 13px;
  line-height: 1.6;
}

.chat-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.08);
}

.chat-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.send-btn {
  position: absolute;
  right: 6px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: #94a3b8;
  cursor: pointer;
  border-radius: 6px;
  transition: color 0.2s, background 0.2s;
}

.send-btn:hover:not(:disabled) {
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.08);
}

.send-btn:disabled {
  cursor: not-allowed;
  opacity: 0.4;
}

.panel-enter-active {
  transition: opacity 0.25s ease-out;
}

.panel-enter-active .chat-panel {
  transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}

.panel-leave-active {
  transition: opacity 0.2s ease-in;
}

.panel-leave-active .chat-panel {
  transition: transform 0.2s ease-in;
}

.panel-enter-from {
  opacity: 0;
}

.panel-enter-from .chat-panel {
  transform: translateX(100%);
}

.panel-leave-to {
  opacity: 0;
}

.panel-leave-to .chat-panel {
  transform: translateX(100%);
}

.dropdown-enter-active {
  transition: opacity 0.15s, transform 0.15s;
}

.dropdown-leave-active {
  transition: opacity 0.1s, transform 0.1s;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

@keyframes spin-once {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
