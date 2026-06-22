<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { httpInstance, type Response } from '@/utils/http'
import Toast from '@/utils/toast/Toast.vue'

interface TokensUsageRecord {
  date: string
  prompt_tokens_consume: number
  completion_tokens_consume: number
  total_tokens_consume: number
}

interface ChartDay {
  date: Date
  label: string
  prompt: number
  completion: number
  total: number
}

const isLoading = ref(true)
const hasError = ref(false)
const chartData = ref<ChartDay[]>([])
const hoveredDay = ref<ChartDay | null>(null)
const hoverX = ref(0)
const hoverY = ref(0)
const chartReady = ref(false)
const svgContainer = ref<HTMLElement | null>(null)

const toastRef = ref()
const toastMsg = ref('')
const toastType = ref<'success' | 'error'>('error')

const showToast = (message: string, type: 'success' | 'error' = 'error') => {
  toastMsg.value = message
  toastType.value = type
  toastRef.value?.show()
}

const TOKEN_LIMIT_LINE = 1000000

const BAR_COLORS = {
  prompt: '#1e40af',
  promptHover: '#1e3a8a',
  completion: '#60a5fa',
  completionHover: '#3b82f6',
}

const generateMonthDays = (): Date[] => {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const days: Date[] = []
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(new Date(year, month, d))
  }
  return days
}

const formatDateLabel = (date: Date): string => `${date.getMonth() + 1}.${date.getDate()}`

const formatTokenCount = (count: number): string => {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}k`
  return count.toLocaleString()
}

const maxTotal = computed(() => {
  if (chartData.value.length === 0) return 100
  const max = Math.max(...chartData.value.map(d => d.total), 100)
  return Math.ceil(max * 1.2)
})

// 调整 viewBox 比例以适配半宽卡片
const svgWidth = 600
const svgHeight = 340
const chartPadding = { top: 38, right: 42, bottom: 54, left: 66 }
const chartWidth = svgWidth - chartPadding.left - chartPadding.right
const chartHeight = svgHeight - chartPadding.top - chartPadding.bottom

const yGridLines = computed(() => {
  const count = 5
  const lines: { value: number; y: number; label: string }[] = []
  for (let i = 0; i <= count; i++) {
    const value = (maxTotal.value / count) * i
    const y = chartPadding.top + chartHeight - (value / maxTotal.value) * chartHeight
    lines.push({ value, y, label: formatTokenCount(value) })
  }
  return lines
})

const bars = computed(() => {
  if (chartData.value.length === 0) return []
  const data = chartData.value
  const count = data.length
  const gapRatio = 0.45
  const barWidth = (chartWidth / count) * (1 - gapRatio)
  const gap = (chartWidth / count) * gapRatio

  return data.map((day, i) => {
    const x = chartPadding.left + (chartWidth / count) * i + gap / 2
    const promptH = (day.prompt / maxTotal.value) * chartHeight
    const completionH = (day.completion / maxTotal.value) * chartHeight
    const totalH = promptH + completionH
    const y = chartPadding.top + chartHeight - totalH

    return {
      x,
      y,
      barWidth: Math.max(barWidth, 2),
      promptHeight: Math.max(promptH, day.prompt > 0 ? 2 : 0),
      completionHeight: Math.max(completionH, day.completion > 0 ? 2 : 0),
      totalHeight: totalH,
      day,
    }
  })
})

const tokenLimitY = computed(() => {
  return chartPadding.top + chartHeight - (TOKEN_LIMIT_LINE / maxTotal.value) * chartHeight
})

const fetchData = async () => {
  isLoading.value = true
  hasError.value = false
  try {
    const res = await httpInstance.get<any, Response>('/tokens_usage')
    if (res.code !== 200) {
      hasError.value = true
      showToast(res.message || '获取用量数据失败')
      return
    }
    const records: TokensUsageRecord[] = res.data || []
    const monthDays = generateMonthDays()
    const recordMap = new Map<string, TokensUsageRecord>()
    records.forEach(r => {
      const d = new Date(r.date)
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
      recordMap.set(key, r)
    })

    chartData.value = monthDays.map(date => {
      const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
      const rec = recordMap.get(key)
      return {
        date,
        label: formatDateLabel(date),
        prompt: rec?.prompt_tokens_consume ?? 0,
        completion: rec?.completion_tokens_consume ?? 0,
        total: rec?.total_tokens_consume ?? 0,
      }
    })
  } catch {
    hasError.value = true
    showToast('网络错误，请稍后重试')
  } finally {
    isLoading.value = false
    await nextTick()
    chartReady.value = true
  }
}

const handleBarEnter = (day: ChartDay, event: MouseEvent) => {
  hoveredDay.value = day
  if (svgContainer.value) {
    const rect = svgContainer.value.getBoundingClientRect()
    hoverX.value = event.clientX - rect.left
    hoverY.value = event.clientY - rect.top
  }
}

const handleBarLeave = () => {
  hoveredDay.value = null
}

const monthsLabels = computed(() => {
  if (chartData.value.length === 0) return { first: '', last: '' }
  return {
    first: chartData.value[0]!.label,
    last: chartData.value[chartData.value.length - 1]!.label,
  }
})

// 占位图的静态柱状预览数据
const placeholderBars = [
  [28, 46, 22, 56, 38, 50, 32],
  [38, 26, 50, 36, 58, 30, 42],
  [22, 42, 32, 52, 36, 46, 24],
]

const handleRetry = () => fetchData()

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="usage-container">
    <!-- Header -->
    <div class="usage-header">
      <div class="usage-title-row">
        <h2 class="usage-title">Token 用量统计</h2>
        <span class="usage-subtitle">当月</span>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="state-wrapper">
      <div class="loading-state">
        <div class="loading-spinner">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2">
            <circle cx="12" cy="12" r="10" stroke-dasharray="32" stroke-dashoffset="32" stroke-linecap="round">
              <animate attributeName="stroke-dashoffset" values="32;0" dur="1.2s" repeatCount="indefinite"/>
            </circle>
          </svg>
        </div>
        <span class="loading-text">加载中...</span>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="hasError" class="state-wrapper">
      <div class="error-state">
        <div class="error-icon">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <p class="error-text">数据加载失败</p>
        <button class="retry-btn" @click="handleRetry">重新加载</button>
      </div>
    </div>

    <!-- Chart Grid 2x2 -->
    <div v-else class="charts-grid">
      <!-- 1. 真实数据图 (左上) -->
      <div class="chart-card" :class="{ ready: chartReady }">
        <div class="chart-card-header">
          <h3 class="chart-card-title">每日消耗趋势</h3>
          <div class="legend">
            <div class="legend-item">
              <span class="legend-dot" style="background:#1e40af"></span>
              <span>输入</span>
            </div>
            <div class="legend-item">
              <span class="legend-dot" style="background:#60a5fa"></span>
              <span>输出</span>
            </div>
          </div>
        </div>
        <div class="chart-body" ref="svgContainer">
          <svg :viewBox="`0 0 ${svgWidth} ${svgHeight}`" class="chart-svg" preserveAspectRatio="xMidYMid meet">
            <g v-for="(line, i) in yGridLines" :key="'grid-' + i">
              <line
                :x1="chartPadding.left"
                :y1="line.y"
                :x2="svgWidth - chartPadding.right"
                :y2="line.y"
                stroke="rgba(148,163,184,0.15)"
                stroke-width="1"
                :stroke-dasharray="i === yGridLines.length - 1 ? 'none' : '4,4'"
              />
              <text
                :x="chartPadding.left - 8"
                :y="line.y + 4"
                text-anchor="end"
                class="y-label"
              >{{ line.label }}</text>
            </g>

            <line
              v-if="tokenLimitY > chartPadding.top && tokenLimitY < svgHeight - chartPadding.bottom"
              :x1="chartPadding.left"
              :y1="tokenLimitY"
              :x2="svgWidth - chartPadding.right"
              :y2="tokenLimitY"
              stroke="rgba(234,179,8,0.4)"
              stroke-width="1"
              stroke-dasharray="6,3"
            />
            <text
              v-if="tokenLimitY > chartPadding.top && tokenLimitY < svgHeight - chartPadding.bottom"
              :x="svgWidth - chartPadding.right"
              :y="tokenLimitY - 5"
              text-anchor="end"
              class="limit-label"
            >免费额度</text>

            <g
              v-for="(bar, i) in bars"
              :key="'bar-' + i"
              class="bar-group"
              @mouseenter="handleBarEnter(bar.day, $event)"
              @mouseleave="handleBarLeave"
            >
              <rect
                v-if="bar.promptHeight > 0"
                :x="bar.x"
                :y="bar.y + bar.completionHeight"
                :width="bar.barWidth"
                :height="bar.promptHeight"
                :rx="bar.completionHeight === 0 ? 3 : 0"
                :fill="hoveredDay?.date.getDate() === bar.day.date.getDate() ? BAR_COLORS.promptHover : BAR_COLORS.prompt"
                class="bar-segment"
              />
              <rect
                v-if="bar.completionHeight > 0"
                :x="bar.x"
                :y="bar.y"
                :width="bar.barWidth"
                :height="bar.completionHeight"
                :rx="bar.promptHeight === 0 ? 3 : 0"
                :fill="hoveredDay?.date.getDate() === bar.day.date.getDate() ? BAR_COLORS.completionHover : BAR_COLORS.completion"
                class="bar-segment"
              />
              <rect
                :x="bar.x - 3"
                :y="bar.y - 4"
                :width="bar.barWidth + 6"
                :height="bar.totalHeight + 8"
                fill="transparent"
                class="bar-hitarea"
              />
            </g>

            <line
              :x1="chartPadding.left"
              :y1="svgHeight - chartPadding.bottom"
              :x2="svgWidth - chartPadding.right"
              :y2="svgHeight - chartPadding.bottom"
              stroke="rgba(148,163,184,0.25)"
              stroke-width="1"
            />

            <text
              v-if="monthsLabels.first"
              :x="chartPadding.left"
              :y="svgHeight - 10"
              text-anchor="start"
              class="x-label"
            >{{ monthsLabels.first }}</text>
            <text
              v-if="monthsLabels.last"
              :x="svgWidth - chartPadding.right"
              :y="svgHeight - 10"
              text-anchor="end"
              class="x-label"
            >{{ monthsLabels.last }}</text>
          </svg>

          <Transition name="card-slide">
            <div
              v-if="hoveredDay"
              class="hover-card"
              :style="{
                left: Math.min(hoverX + 16, (svgContainer?.clientWidth ?? 400) - 170) + 'px',
                top: Math.max(Math.min(hoverY - 50, (svgContainer?.clientHeight ?? 300) - 120), 8) + 'px'
              }"
            >
              <div class="hover-card-date">
                {{ hoveredDay.date.getFullYear() }}-{{ String(hoveredDay.date.getMonth() + 1).padStart(2, '0') }}-{{ String(hoveredDay.date.getDate()).padStart(2, '0') }}
              </div>
              <div class="hover-card-row">
                <span class="hover-dot" style="background:#1e40af"></span>
                <span class="hover-label">输入</span>
                <span class="hover-value">{{ hoveredDay.prompt.toLocaleString() }}</span>
              </div>
              <div class="hover-card-row">
                <span class="hover-dot" style="background:#60a5fa"></span>
                <span class="hover-label">输出</span>
                <span class="hover-value">{{ hoveredDay.completion.toLocaleString() }}</span>
              </div>
              <div class="hover-card-divider"></div>
              <div class="hover-card-row total">
                <span class="hover-label">总计</span>
                <span class="hover-value">{{ hoveredDay.total.toLocaleString() }}</span>
              </div>
            </div>
          </Transition>
        </div>
      </div>

      <!-- 2. 占位图：模型调用趋势 (右上) -->
      <div class="chart-card chart-placeholder">
        <div class="chart-card-header">
          <h3 class="chart-card-title placeholder-title">模型调用趋势</h3>
          <span class="placeholder-tag">即将上线</span>
        </div>
        <div class="chart-body placeholder-body">
          <svg viewBox="0 0 280 140" class="placeholder-svg" preserveAspectRatio="xMidYMid meet">
            <rect
              v-for="(h, i) in placeholderBars[0]"
              :key="'p1-' + i"
              :x="23 + i * 36"
              :y="120 - h"
              width="16"
              :height="h"
              rx="3"
              fill="#cbd5e1"
              :opacity="0.35 + (i % 3) * 0.08"
            />
            <line x1="14" y1="120" x2="266" y2="120" stroke="rgba(148,163,184,0.3)" stroke-width="1"/>
          </svg>
        </div>
      </div>

      <!-- 3. 占位图：响应耗时分布 (左下) -->
      <div class="chart-card chart-placeholder">
        <div class="chart-card-header">
          <h3 class="chart-card-title placeholder-title">响应耗时分布</h3>
          <span class="placeholder-tag">即将上线</span>
        </div>
        <div class="chart-body placeholder-body">
          <svg viewBox="0 0 280 140" class="placeholder-svg" preserveAspectRatio="xMidYMid meet">
            <rect
              v-for="(h, i) in placeholderBars[1]"
              :key="'p2-' + i"
              :x="23 + i * 36"
              :y="120 - h"
              width="16"
              :height="h"
              rx="3"
              fill="#cbd5e1"
              :opacity="0.35 + (i % 3) * 0.08"
            />
            <line x1="14" y1="120" x2="266" y2="120" stroke="rgba(148,163,184,0.3)" stroke-width="1"/>
          </svg>
        </div>
      </div>

      <!-- 4. 占位图：用户活跃分析 (右下) -->
      <div class="chart-card chart-placeholder">
        <div class="chart-card-header">
          <h3 class="chart-card-title placeholder-title">用户活跃分析</h3>
          <span class="placeholder-tag">即将上线</span>
        </div>
        <div class="chart-body placeholder-body">
          <svg viewBox="0 0 280 140" class="placeholder-svg" preserveAspectRatio="xMidYMid meet">
            <rect
              v-for="(h, i) in placeholderBars[2]"
              :key="'p3-' + i"
              :x="23 + i * 36"
              :y="120 - h"
              width="16"
              :height="h"
              rx="3"
              fill="#cbd5e1"
              :opacity="0.35 + (i % 3) * 0.08"
            />
            <line x1="14" y1="120" x2="266" y2="120" stroke="rgba(148,163,184,0.3)" stroke-width="1"/>
          </svg>
        </div>
      </div>
    </div>

    <!-- Tips -->
    <div class="usage-tips">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="16" x2="12" y2="12"/>
        <line x1="12" y1="8" x2="12.01" y2="8"/>
      </svg>
      <span>数据更新存在一定延迟，悬停柱状图可查看当日详细消耗数据</span>
    </div>

    <Toast ref="toastRef" :message="toastMsg" :type="toastType" :duration="3000" />
  </div>
</template>

<style scoped>
/* 容器：统一背景、flex 列布局，自适应填满父容器 */
.usage-container {
  background: rgb(244, 247, 249);
  border-radius: 12px;
  padding: 20px 22px 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
  min-height: 0;
  box-sizing: border-box;
  overflow: hidden;
}
/* Header */
.usage-header {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4px;
}

.usage-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.usage-title {
  font-family: 'Outfit', sans-serif;
  font-size: 22px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0;
  letter-spacing: -0.3px;
}

.usage-subtitle {
  font-size: 12px;
  font-weight: 500;
  color: #3b82f6;
  background: rgba(59,130,246,0.1);
  padding: 3px 10px;
  border-radius: 20px;
  letter-spacing: 0.3px;
}

/* Loading / Error State 占满网格区域 */
.state-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.04);
}

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
}

.loading-text,
.error-text {
  font-size: 14px;
  color: #888;
  margin: 0;
  letter-spacing: 0.3px;
}

.error-icon { opacity: 0.6; }

.retry-btn {
  padding: 8px 20px;
  border: 1px solid rgba(59,130,246,0.3);
  border-radius: 8px;
  background: transparent;
  color: #3b82f6;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.retry-btn:hover {
  background: rgba(59,130,246,0.06);
  border-color: #3b82f6;
}

/* 2x2 网格 - 等比分配空间 */
.charts-grid {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 16px;
  min-height: 0;
  overflow: hidden;
}

/* 卡片 */
.chart-card {
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.04);
  border: 1px solid rgba(0,0,0,0.04);
  padding: 20px 24px 16px;
  display: flex;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
  transition: box-shadow 0.25s ease, transform 0.25s ease;
  opacity: 0;
  transform: translateY(8px);
  animation: cardEnter 0.45s ease forwards;
}

.chart-card:hover {
  box-shadow: 0 4px 18px rgba(0,0,0,0.06);
  transform: translateY(-1px);
}

.chart-card:nth-child(1) { animation-delay: 0s; }
.chart-card:nth-child(2) { animation-delay: 0.08s; }
.chart-card:nth-child(3) { animation-delay: 0.16s; }
.chart-card:nth-child(4) { animation-delay: 0.24s; }

@keyframes cardEnter {
  to { opacity: 1; transform: translateY(0); }
}

.chart-card-header {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.chart-card-title {
  font-family: 'Outfit', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #1a1a2e;
  margin: 0;
  letter-spacing: -0.2px;
}

.legend {
  display: flex;
  gap: 14px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 500;
  color: #64748b;
  letter-spacing: 0.2px;
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 2px;
}

/* Chart body 自适应填充 */
.chart-body {
  position: relative;
  flex: 1;
  min-height: 0;
  width: 100%;
  overflow: hidden;
}

.chart-svg {
  width: 100%;
  height: 100%;
  display: block;
}

.y-label {
  fill: #94a3b8;
  font-size: 14px;
  font-family: 'JetBrains Mono', monospace;
}

.x-label {
  fill: #64748b;
  font-size: 15px;
  font-family: 'Outfit', sans-serif;
  font-weight: 500;
}

.limit-label {
  fill: #eab308;
  font-size: 10px;
  font-family: 'Outfit', sans-serif;
  font-weight: 500;
}

.bar-group { cursor: pointer; }
.bar-segment { transition: fill 0.2s ease; }
.bar-group:hover .bar-segment { filter: brightness(1.1); }
.bar-hitarea { cursor: pointer; }

/* Hover Card */
.hover-card {
  position: absolute;
  z-index: 10;
  background: rgba(15,23,42,0.94);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 10px;
  padding: 12px 14px;
  min-width: 156px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.18);
  pointer-events: none;
}

.hover-card-date {
  font-size: 11px;
  font-weight: 500;
  color: rgba(255,255,255,0.5);
  margin-bottom: 8px;
  letter-spacing: 0.3px;
  font-family: 'JetBrains Mono', monospace;
}

.hover-card-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 3px 0;
}

.hover-dot {
  width: 8px;
  height: 8px;
  border-radius: 2px;
  flex-shrink: 0;
}

.hover-label {
  font-size: 12px;
  font-weight: 500;
  color: rgba(255,255,255,0.65);
  flex-shrink: 0;
}

.hover-value {
  font-size: 12px;
  font-weight: 600;
  color: rgba(255,255,255,0.92);
  margin-left: auto;
  font-family: 'JetBrains Mono', monospace;
  letter-spacing: -0.3px;
  white-space: nowrap;
}

.hover-card-divider {
  height: 1px;
  background: rgba(255,255,255,0.08);
  margin: 6px 0;
}

.hover-card-row.total .hover-label {
  color: rgba(255,255,255,0.75);
  font-weight: 600;
}

.hover-card-row.total .hover-value {
  color: #fff;
  font-weight: 700;
}

.card-slide-enter-active { transition: all 0.2s cubic-bezier(0.16,1,0.3,1); }
.card-slide-leave-active { transition: all 0.15s ease-in; }
.card-slide-enter-from { opacity: 0; transform: translateX(8px) scale(0.96); }
.card-slide-leave-to { opacity: 0; transform: translateX(4px) scale(0.98); }

/* 占位图样式 */
.chart-placeholder .placeholder-title {
  color: #94a3b8;
}

.placeholder-tag {
  font-size: 10px;
  font-weight: 500;
  color: #94a3b8;
  background: rgba(148,163,184,0.1);
  padding: 3px 10px;
  border-radius: 12px;
  letter-spacing: 0.3px;
}

.placeholder-body {
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-svg {
  width: 100%;
  height: 100%;
  max-height: 100%;
}

/* 底部 Tips */
.usage-tips {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: rgba(59,130,246,0.05);
  border: 1px solid rgba(59,130,246,0.1);
  border-radius: 10px;
  font-size: 12px;
  color: #64748b;
  letter-spacing: 0.2px;
}

.usage-tips svg {
  flex-shrink: 0;
  color: #3b82f6;
  opacity: 0.75;
}

/* 响应式 */
@media (max-width: 900px) {
  .charts-grid {
    grid-template-columns: 1fr;
    grid-template-rows: repeat(4, minmax(180px, 1fr));
  }
  .usage-container {
    min-height: auto;
  }
}
</style>