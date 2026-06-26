下面是整理后的正式版，保留你原有规范体系，同时统一成更适合项目文档沉淀的表达，并且完全收敛为淡蓝白色调，去掉所有紫色倾向。

```md
# 项目统一样式标准

> 设计目标：统一为“淡蓝 + 白”的视觉体系，整体风格清爽、轻盈、现代，避免任何紫色、蓝紫色、薰衣草感。

---

## 一、色彩体系

### 1.1 主色（Blue Series）

```css
--primary-50:  #f8fbff   (浅色背景 / 渐变起始)
--primary-100: #eef6ff   (浅背景 / 渐变过渡)
--primary-200: #e3f0ff   (分隔过渡 / 轻背景)
--primary-400: #60a5fa   (按钮渐变 / 悬停蓝)
--primary-500: #3b82f6   (主品牌色 / 链接 / 激活态)
--primary-600: #2563eb   (按钮渐变 / 标题渐变深色)
--primary-700: #1d4ed8   (保存按钮 / 确认按钮)
--primary-800: #1e40af   (按钮 hover 深色)

--primary-gradient: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)
--primary-gradient-light: linear-gradient(135deg, #93c5fd 0%, #60a5fa 100%)

--primary-rgba-bg: rgba(59, 130, 246, 0.08)      (hover 背景)
--primary-rgba-active: rgba(59, 130, 246, 0.12)   (激活背景)
--primary-shadow: rgba(59, 130, 246, 0.28)        (按钮阴影)
```

### 1.2 辅助色

> 辅助色仅用于 Logo、Hover、Card 强调等场景，必须保持蓝系，不得引入紫色。

```css
--accent-400: #38bdf8   (Logo 默认渐变 / 悬停色)
--accent-rgba-bg: rgba(56, 189, 248, 0.08)      (hover 背景)
--accent-rgba-active: rgba(56, 189, 248, 0.12)   (激活背景)
```

### 1.3 中性色

```css
--text-primary:      #1e293b   (标题 / 正文)
--text-secondary:    #334155   (二级文字)
--text-tertiary:     #64748b   (辅助文字)
--text-muted:        #94a3b8   (弱化文字)
--text-light:        #64748b   (导航文字 / 副标题)
--text-placeholder:  #cbd5e1   (占位符)

--bg-white:          #ffffff
--bg-card:           #ffffff
--bg-container:      rgba(248, 251, 255, 0.88)   (组件容器)
--bg-overlay:        rgba(15, 23, 42, 0.42)      (弹框蒙层)
--bg-overlay-light:  rgba(240, 246, 255, 0.86)   (Dialog 蒙层)

--border-light:      rgba(59, 130, 246, 0.08)    (卡片边框)
--border-divider:    #e5eef9 / #edf2f7 / #f0f4f8 (分割线)
--border-focus:      #60a5fa                     (输入框聚焦)
```

### 1.4 语义色

```css
--success:      #22c55e   (成功文字)
--success-bg:    #bbf7d0   (成功边框)

--error:        #ef4444 / #e74c3c / #ff4d4f   (错误 / 删除)
--error-bg:     #fecaca / #fee                (错误边框 / 删除 hover 背景)
--error-hover:  #dc2626                       (删除 hover 加深)
```

### 1.5 背景渐变

```css
--bg-gradient-page: linear-gradient(135deg, #f8fbff 0%, #eef6ff 50%, #eaf3ff 100%)
```

---

## 二、布局规范

| 属性 | 值 |
|------|----|
| 页面最小高度 | `min-height: 100vh` |
| 大容器圆角 | `border-radius: 12px` |
| 卡片圆角 | `border-radius: 14px` |
| 容器内边距 | `padding: 24px` |
| 容器外间距 | `margin: 16px` |
| 卡片阴影 | `0 2px 12px rgba(0, 0, 0, 0.05)` |
| 卡片 hover | `translateY(-4px)`，`box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1)` |
| 卡片边框 | `border: 1px solid rgba(59, 130, 246, 0.08)` |
| 卡片间距 | `gap: 20px` |

---

## 三、排版规范

| 层级 | font-size | font-weight | color |
|------|-----------|-------------|-------|
| H1（页面大标题） | `60px` | `800` | `linear-gradient(#2563eb → #60a5fa)` |
| H2（组件标题） | `22px` | `700` | `#1e293b` |
| 卡片标题 | `17px` | `700` | `#1e293b` |
| 正文 | `14px` | `400` | `#334155 / #64748b` |
| 辅助文字 | `13px` | `400` | `#94a3b8 / #cbd5e1` |
| 副标题 | `16px` | `400` | `#64748b` |
| 按钮文字 | `15px` | `600` | — |
| 导航链接 | `15px` | `400` | `#64748b` |

- 英文标题字体：`'Outfit', sans-serif`
- 代码 / 值字体：`'JetBrains Mono', monospace`

---

## 四、按钮规范

### 4.1 主按钮（Primary）

```css
padding: 12px 24px
border-radius: 10px / 8px
font-size: 15px
font-weight: 600
background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)
color: #fff
box-shadow: 0 4px 16px rgba(59, 130, 246, 0.3)
transition: all 0.25s ease

hover:
  transform: translateY(-2px)
  box-shadow: 0 6px 24px rgba(59, 130, 246, 0.4)
```

### 4.2 次要按钮（Secondary）

```css
padding: 12px 28px
border-radius: 8px
font-size: 15px
font-weight: 600
background: #fff
color: #3b82f6
border: 2px solid #3b82f6

hover:
  transform: translateY(-2px)
  background: #eef6ff
  box-shadow: 0 4px 14px rgba(59, 130, 246, 0.2)
```

### 4.3 取消按钮（Cancel）

```css
padding: 8px 20px
border-radius: 6px
font-size: 14px
font-weight: 500
background: #fff / #f1f5f9
color: #334155 / #64748b
border: 1px solid #dbe3ee

hover:
  background: #f5f7fa / #e2e8f0
```

### 4.4 确认按钮（Confirm）

```css
background: #4A90D9
color: #fff
border: none
border-radius: 6px
padding: 8px 20px

hover:
  background: #3a7fc8
  box-shadow: 0 2px 8px rgba(74, 144, 217, 0.3)
```

### 4.5 操作按钮（如“添加文档”）

```css
padding: 8px 12px
border-radius: 8px
font-size: 13px
font-weight: 600
border: none
background: rgba(59, 130, 246, 0.1)
color: #3b82f6

hover:
  background: rgba(59, 130, 246, 0.2)
```

---

## 五、表单规范

```css
输入框:
  padding: 10px 14px
  border: 1px solid rgba(0, 0, 0, 0.12)
  border-radius: 8px
  font-size: 14px
  color: #334155
  background: #fff
  transition: border-color 0.2s ease, box-shadow 0.2s ease

聚焦态:
  outline: none
  border-color: #60a5fa
  box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.12)

只读态:
  background: #e9eef5
  color: #64748b
  cursor: not-allowed

占位符:
  color: #cbd5e1

Label:
  display: block
  font-size: 14px
  font-weight: 500
  color: #334155
  margin-bottom: 8px / 6px

Form spacing:
  margin-bottom: 16px
```

---

## 六、自定义下拉框（Custom Select）

```css
容器:
  position: relative
  outline: none

触发器:
  display: flex
  align-items: center
  justify-content: space-between
  padding: 10px 12px
  border: 1px solid rgba(0, 0, 0, 0.12)
  border-radius: 8px
  font-size: 14px
  color: #334155
  background: #fff
  cursor: pointer

hover:
  border-color: #60a5fa

箭头:
  font-size: 12px
  color: #94a3b8
  transition: transform 0.2s ease

.open:
  transform: rotate(180deg)

下拉面板:
  position: absolute
  top: calc(100% + 4px)
  left: 0
  right: 0
  z-index: 100
  background: #fff
  border: 1px solid rgba(0, 0, 0, 0.12)
  border-radius: 8px
  max-height: 120px
  overflow-y: auto
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1)

选项:
  padding: 10px 12px
  font-size: 14px
  color: #334155
  cursor: pointer
  transition: background 0.15s ease

hover:
  background: rgba(56, 189, 248, 0.08)

active:
  color: #3b82f6
  font-weight: 600
  background: rgba(59, 130, 246, 0.06)

disabled:
  color: #cbd5e1
  cursor: default
```

---

## 七、弹框 / 对话框规范

### 7.1 对话框 Dialog（`src/utils/dialog/Dialog.vue`）

```css
蒙层:
  background: rgba(240, 246, 255, 0.86)
  z-index: 9998

容器:
  background: #ffffff
  border-radius: 12px
  box-shadow: 0 8px 32px rgba(74, 144, 217, 0.15)
  min-width: 400px
  max-width: 480px
  border: 1px solid rgba(59, 130, 246, 0.1)

标题:
  padding: 20px 24px 12px
  border-bottom: 1px solid rgba(59, 130, 246, 0.1)
  font-size: 17px
  font-weight: 600
  color: #1e293b

内容区:
  padding: 20px 24px
  font-size: 14px
  line-height: 1.6
  color: #475569

底部按钮区:
  padding: 16px 24px 20px
  display: flex
  justify-content: flex-end
  gap: 12px
```

### 7.2 内联弹框（`dashboard/index.vue`）

```css
蒙层:
  background: rgba(0, 0, 0, 0.4)
  z-index: 1000

容器:
  background: #f8f9fa
  border-radius: 12px
  width: 420px
  max-width: 90%
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15), 0 2px 10px rgba(0, 0, 0, 0.1)
  border: 1px solid #e0e0e0

头部:
  padding: 18px 24px
  border-bottom: 1px solid #e0e0e0
  background: linear-gradient(to bottom, #ffffff, #f5f5f5)
  border-radius: 12px 12px 0 0

底部:
  padding: 16px 24px
  border-top: 1px solid #e0e0e0
  background: linear-gradient(to bottom, #f5f5f5, #ececec)
  border-radius: 0 0 12px 12px
```

---

## 八、Toast 规范

```css
位置:
  fixed
  top: 10%
  left: 50%
  transform: translateX(-50%)
  z-index: 9999

样式:
  padding: 12px 24px
  border-radius: 8px
  background: #fff
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15)
  font-weight: 500
  pointer-events: none

成功:
  color: #22c55e
  border: 1px solid #bbf7d0

错误:
  color: #ef4444
  border: 1px solid #fecaca

进入动画:
  slide-in 0.4s ease-out
  from: translate(-50%, -100%) + opacity 0
  to:   translate(-50%, 0) + opacity 1

离开动画:
  fade-out 0.4s ease-in
  from: translate(-50%, 0) + opacity 1
  to:   translate(-50%, -20px) + opacity 0

默认 duration:
  1500ms
```

---

## 九、动画与过渡标准

### 9.1 Transition Name 体系

| Transition Name | 用途 | 时长 | 缓动函数 |
|----------------|------|------|----------|
| `dropdown` | 下拉菜单展开收起 | `0.25s / 0.2s` | `ease / ease-out` |
| `fade` | 淡入淡出（提示条等） | `0.4s` | `ease` |
| `select-dropdown` | 自定义下拉选择 | `0.2s out / 0.15s in reverse` | `ease-out / ease-in` |
| `dialog-fade` | Dialog 弹框 | `0.3s out / 0.2s in` | `ease-out / ease-in` |
| `toast-fade` | Toast 提示 | `0.4s` | `ease-out / ease-in` |

### 9.2 自定义动画 keyframes 体系

| 动画名 | 用途 | 详情 |
|--------|------|------|
| `fadeIn` | 弹框蒙层出现 | `opacity 0 → 1`，`0.2s ease-out` |
| `scaleIn` | 弹框内容出现 | `scale(0.95 → 1)` + `opacity(0 → 1)`，`0.2s ease-out` |
| `float` | 粒子浮动 | `translateY(-20px)` + `scale(1.2)`，`5s ease-in-out infinite` |
| `dropdownIn` | 下拉面板展开 | `translateY(-8px)` + `scale(0.97 → 1)` + `opacity`，`0.2s` |
| `selectDropdownIn` | 选择下拉面板 | 同上 |
| `dialog-zoom-in` | Dialog 蒙层出现 | `opacity 0 → 1`，`0.3s` |
| `dialog-scale-in` | Dialog 内容出现 | `scale(0.9 → 1)` + `opacity`，`0.3s` |
| `dialog-scale-out` | Dialog 内容消失 | `scale(1 → 0.9)` + `opacity`，`0.2s` |
| `spin` | 加载旋转动画 | `rotate 360deg`，`0.8s linear infinite` |

### 9.3 Vue Transition 用法模式

```vue
<!-- 下拉菜单 -->
<Transition name="dropdown">
  <div v-if="showDropdown" class="provider-dropdown">...</div>
</Transition>

<!-- 淡入淡出 -->
<Transition name="fade">
  <div v-if="showHint" class="footer-tips">...</div>
</Transition>

<!-- Dialog -->
<Transition name="dialog-fade">
  <div v-if="visible" class="dialog-overlay">...</div>
</Transition>

<!-- Toast -->
<Transition name="toast-fade">
  <div v-if="visible" class="toast-container">...</div>
</Transition>
```

---

## 十、通用 CSS Transition 时长

| 场景 | 时长 | 缓动 |
|------|------|------|
| 卡片 / 元素 hover 变换 | `0.3s` | `ease` |
| 按钮 hover | `0.25s` | `ease` |
| 表单输入 focus | `0.2s` | `ease` |
| 选项 hover | `0.15s` | `ease` |

---

## 十一、Loading 状态

```css
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  color: #94a3b8;
  font-size: 14px;
}

.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid rgba(96, 165, 250, 0.15);
  border-top-color: #60a5fa;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
```

---

## 十二、空状态

```css
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  color: #94a3b8;
  font-size: 14px;
  gap: 8px;
}
```

---

## 十三、组件容器通用样式

### 13.1 Dashboard 子组件容器（Component2 / Component3）

```css
.component-container {
  background: rgba(248, 251, 255, 0.88);
  border-radius: 12px;
  padding: 24px;
  margin: 16px;
  min-height: calc(100% - 32px);
}
```

### 13.2 简单内容组件（Component1 / Component4）

```css
.component-content {
  padding: 24px;
}
```

---

## 十四、Topbar 标准

统一使用 `src/style/o-topbar1.css`。

```css
背景:
  rgba(255, 255, 255, 0.7)
  backdrop-filter: blur(10px)

底部边框:
  1px solid rgba(59, 130, 246, 0.1)

z-index:
  10

内容区:
  max-width: 1400px
  margin: 0 auto
  padding: 16px 0

Logo:
  font-size: 25px
  font-weight: 700
  color: #64748b

导航链接:
  color: #64748b
  font-size: 15px
  text-decoration: none

hover:
  color: #3b82f6

::after:
  底部 underline 2px
  hover 时 width: 0 → 100%
```

---

## 十五、侧边栏标准

```css
width: 200px
flex-shrink: 0
background: rgba(248, 251, 255, 0.88)
backdrop-filter: blur(10px)
border-right: 1px solid rgba(59, 130, 246, 0.1)

链接:
  padding: 14px 16px
  padding-left: 28px
  color: #64748b
  font-size: 16px
  font-weight: 500
  border-radius: 8px
  transition: all 0.3s ease

hover:
  background: rgba(59, 130, 246, 0.08)
  color: #3b82f6

active:
  background: rgba(59, 130, 246, 0.12)
  color: #3b82f6
```

---

## 十六、CSS 变量提案（未来迁移目标）

建议逐步统一引入 CSS 变量，形成可维护的设计系统。

```css
:root {
  /* Primary */
  --clr-primary: #3b82f6;
  --clr-primary-dark: #2563eb;
  --clr-primary-light: #60a5fa;
  --clr-primary-bg: rgba(59, 130, 246, 0.08);
  --clr-primary-active: rgba(59, 130, 246, 0.12);

  /* Accent */
  --clr-accent: #38bdf8;
  --clr-accent-bg: rgba(56, 189, 248, 0.08);
  --clr-accent-active: rgba(56, 189, 248, 0.12);

  /* Text */
  --clr-text-heading: #1e293b;
  --clr-text-body: #334155;
  --clr-text-secondary: #64748b;
  --clr-text-muted: #94a3b8;
  --clr-text-light: #64748b;

  /* Background */
  --bg-page: linear-gradient(135deg, #f8fbff 0%, #eef6ff 50%, #eaf3ff 100%);
  --bg-container: rgba(248, 251, 255, 0.88);
  --bg-card: #fff;
  --bg-overlay: rgba(15, 23, 42, 0.42);
  --bg-overlay-light: rgba(240, 246, 255, 0.86);

  /* Border */
  --border-card: 1px solid rgba(59, 130, 246, 0.08);
  --border-input: 1px solid rgba(0, 0, 0, 0.12);
  --border-divider: #e5eef9;

  /* Radius */
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 14px;

  /* Shadow */
  --shadow-card: 0 2px 12px rgba(0, 0, 0, 0.05);
  --shadow-dropdown: 0 4px 20px rgba(0, 0, 0, 0.1);
  --shadow-dialog: 0 8px 32px rgba(74, 144, 217, 0.15);
  --shadow-btn-primary: 0 4px 16px rgba(59, 130, 246, 0.3);

  /* Transition */
  --transition-fast: 0.2s ease;
  --transition-normal: 0.25s ease;
  --transition-slow: 0.3s ease;
}
```

---

## 十七、统一执行原则

1. 所有新增样式优先复用本规范中的变量与尺寸。
2. 所有蓝色系使用统一主色，不得再引入紫色、蓝紫色、偏薰衣草色。
3. 所有 hover / active / focus 状态必须保持同一色相体系。
4. 所有阴影优先使用蓝色透明阴影，避免灰紫感。
5. 所有页面背景尽量保持淡蓝白渐变，避免脏灰和重色块。
6. 组件间视觉层级通过明暗与透明度区分，不通过多色系混用区分。
```