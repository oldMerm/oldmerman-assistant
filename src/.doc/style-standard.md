# 项目统一样式标准

## 一、色彩体系

### 主色（Blue Series）
```
--primary-50:  #e8f4fc   (浅色背景/渐变起始)
--primary-100: #d4ecf7   (渐变中间色)
--primary-200: #f0f7fc   (渐变结束)
--primary-400: #60a5fa   (按钮渐变/悬停蓝)
--primary-500: #3b82f6   (主品牌色/链接/激活态)
--primary-600: #2563eb   (按钮渐变/标题渐变深色)
--primary-700: #4a90d9   (保存按钮/确认按钮)
--primary-800: #3a7bc8   (按钮hover深色)

--primary-gradient: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)
--primary-gradient-light: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)

--primary-rgba-bg: rgba(59, 130, 246, 0.08)   (hover背景)
--primary-rgba-active: rgba(59, 130, 246, 0.12) (激活背景)
--primary-shadow: rgba(59, 130, 246, 0.4)       (按钮阴影)
```

### 辅助色（用于 Logo/Card hover 等）
```
--accent-400: #667eea   (Logo默认渐变/悬停色)
--accent-rgba-bg: rgba(102, 126, 234, 0.08)   (hover背景)
--accent-rgba-active: rgba(102, 126, 234, 0.12) (激活背景)
```

### 中性色
```
--text-primary:   #1a1a2e   (标题/正文)
--text-secondary: #333      (二级文字)
--text-tertiary:  #666      (辅助文字)
--text-muted:     #888      (弱化文字)
--text-light:     #64748b   (导航文字/副标题)
--text-placeholder: #aaa    (占位符)

--bg-white:       #fff
--bg-card:        #fff
--bg-container:   rgba(249, 249, 249, 0.85)  (组件容器)
--bg-overlay:     rgba(0, 0, 0, 0.4)         (弹框蒙层)
--bg-overlay-light: rgba(240, 245, 250, 0.85) (Dialog蒙层)

--border-light:   rgba(0, 0, 0, 0.06～0.12)  (卡片边框)
--border-divider: #e0e0e0 / #eee / #f0f0f0   (分割线)
--border-focus:   #667eea                     (输入框聚焦)
```

### 语义色
```
--success:   #52c41a   (成功文字)
--success-bg: #b7eb8f  (成功边框)
--error:     #ff4d4f / #e74c3c / #ef4444  (错误/删除)
--error-bg:  #ffa39e / #fee               (错误边框/删除hover背景)
--error-hover: #c0392b                     (删除hover加深)
```

### 背景渐变（通用）
```
--bg-gradient-page: linear-gradient(135deg, #e8f4fc 0%, #d4ecf7 50%, #f0f7fc 100%)
```

---

## 二、布局规范

| 属性 | 值 |
|------|-----|
| 页面最小高度 | `min-height: 100vh` |
| 容器圆角 | `border-radius: 12px`（大容器）/ `14px`（卡片） |
| 容器内边距 | `padding: 24px`（与边框间距 `margin: 16px`） |
| 卡片阴影 | `0 2px 12px rgba(0, 0, 0, 0.05)` |
| 卡片 hover | `translateY(-4px)`, `box-shadow: 0 8px 32px rgba(0,0,0,0.1)` |
| 卡片边框 | `border: 1px solid rgba(0, 0, 0, 0.06)` |
| 卡片间距 | `gap: 20px` |

---

## 三、排版规范

| 层级 | font-size | font-weight | color |
|------|-----------|-------------|-------|
| H1 (页面大标题) | `60px` | `800` | gradient #2563eb～#60a5fa |
| H2 (组件标题) | `22px` | `700` | `#1a1a2e` |
| 卡片标题 | `17px` | `700` | `#1a1a2e` |
| 正文 | `14px` | `400` | `#333` / `#666` |
| 辅助文字 | `13px` | `400` | `#999` / `#94a3b8` |
| 副标题 | `16px` | `400` | `#64748b` |
| 按钮文字 | `15px` | `600` | — |
| 导航链接 | `15px` | `400` | `#64748b` |

- 英文标题字体: `'Outfit', sans-serif`
- 代码/值字体: `'JetBrains Mono', monospace`

---

## 四、按钮规范

### 主按钮（Primary）
```
padding: 12px 24px
border-radius: 10px / 8px
font-size: 15px
font-weight: 600
background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)
color: #fff
box-shadow: 0 4px 16px rgba(59, 130, 246, 0.3)
transition: all 0.25s ease
hover: transform: translateY(-2px)
       box-shadow: 0 6px 24px rgba(59, 130, 246, 0.4)
```

### 次要按钮（Secondary）
```
padding: 12px 28px
border-radius: 8px
font-size: 15px
font-weight: 600
background: #fff
color: #3b82f6
border: 2px solid #3b82f6
hover: transform: translateY(-2px)
       background: #f0f7fc
       box-shadow: 0 4px 14px rgba(59, 130, 246, 0.2)
```

### 取消按钮（Cancel）
```
padding: 8px 20px
border-radius: 6px
font-size: 14px
font-weight: 500
background: #fff / #f1f5f9
color: #333 / #64748b
border: 1px solid #ddd
hover: background: #f5f5f5 / #e2e8f0
```

### 确认按钮（Confirm）
```
background: #4A90D9
color: #fff
border: none
border-radius: 6px
padding: 8px 20px
hover: background: #3a7fc8
       box-shadow: 0 2px 8px rgba(74, 144, 217, 0.3)
```

### 操作按钮（如"添加文档"）
```
padding: 8px 12px
border-radius: 8px
font-size: 13px
font-weight: 600
border: none
background: rgba(59, 130, 246, 0.1)
color: #3b82f6
hover: background: rgba(59, 130, 246, 0.2)
```

---

## 五、表单规范

```
输入框:
  padding: 10px 12px (旧) / 10px 14px (新)
  border: 1px solid rgba(0, 0, 0, 0.12) (新)
  border-radius: 8px (新) / 6px (旧)
  font-size: 14px
  color: #333
  background: #fff
  transition: border-color 0.2s ease, box-shadow 0.2s ease

聚焦态:
  outline: none
  border-color: #667eea
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1)

只读态:
  background: #e9e9e9
  color: #666
  cursor: not-allowed

占位符:
  color: #aaa

Label:
  display: block
  font-size: 14px
  font-weight: 500
  color: #333
  margin-bottom: 8px / 6px

Form spacing:
  margin-bottom: 16px
```

---

## 六、自定义下拉框（Custom Select）

```
容器:
  position: relative; outline: none

触发器:
  display: flex; align-items: center; justify-content: space-between
  padding: 10px 12px
  border: 1px solid rgba(0, 0, 0, 0.12); border-radius: 8px
  font-size: 14px; color: #333; background: #fff
  cursor: pointer
  hover: border-color: #667eea

箭头:
  font-size: 12px; color: #888
  transition: transform 0.2s ease
  &.open: transform: rotate(180deg)

下拉面板:
  position: absolute; top: calc(100% + 4px); left: 0; right: 0
  z-index: 100
  background: #fff
  border: 1px solid rgba(0, 0, 0, 0.12); border-radius: 8px
  max-height: 120px; overflow-y: auto
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1)

选项:
  padding: 10px 12px; font-size: 14px; color: #333
  cursor: pointer
  transition: background 0.15s ease
  hover: background: rgba(102, 126, 234, 0.08)
  &.active: color: #667eea; font-weight: 600; background: rgba(102, 126, 234, 0.06)
  &.disabled: color: #aaa; cursor: default
```

---

## 七、弹框/对话框规范

### 对话框 Dialog (`src/utils/dialog/Dialog.vue`)
```
蒙层：
  background: rgba(240, 245, 250, 0.85)
  z-index: 9998

容器：
  background: #ffffff
  border-radius: 12px
  box-shadow: 0 8px 32px rgba(74, 144, 217, 0.15)
  min-width: 400px; max-width: 480px
  border: 1px solid rgba(74, 144, 217, 0.1)

标题：
  padding: 20px 24px 12px
  border-bottom: 1px solid rgba(74, 144, 217, 0.1)
  font-size: 17px; font-weight: 600; color: #1a1a2e

内容区：
  padding: 20px 24px
  font-size: 14px; line-height: 1.6; color: #4a5568

底部按钮区：
  padding: 16px 24px 20px
  display: flex; justify-content: flex-end; gap: 12px
```

### 内联弹框（dashboard/index.vue）
```
蒙层：
  background: rgba(0, 0, 0, 0.4)
  z-index: 1000

容器：
  background: #f8f9fa
  border-radius: 12px
  width: 420px; max-width: 90%
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15), 0 2px 10px rgba(0, 0, 0, 0.1)
  border: 1px solid #e0e0e0

头部：
  padding: 18px 24px
  border-bottom: 1px solid #e0e0e0
  background: linear-gradient(to bottom, #ffffff, #f5f5f5)
  border-radius: 12px 12px 0 0

底部：
  padding: 16px 24px
  border-top: 1px solid #e0e0e0
  background: linear-gradient(to bottom, #f5f5f5, #ececec)
  border-radius: 0 0 12px 12px
```

---

## 八、Toast 规范

```
位置: fixed; top: 10%; left: 50%; transform: translateX(-50%)
z-index: 9999
padding: 12px 24px
border-radius: 8px
background: #fff
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15)
font-weight: 500
pointer-events: none

成功: color: #52c41a; border: 1px solid #b7eb8f
错误: color: #ff4d4f; border: 1px solid #ffa39e

进入动画: slide-in (0.4s ease-out)
  from: translate(-50%, -100%); opacity: 0
  to:   translate(-50%, 0); opacity: 1

离开动画: fade-out (0.4s ease-in)
  from: translate(-50%, 0); opacity: 1
  to:   translate(-50%, -20px); opacity: 0

默认 duration: 1500ms
```

---

## 九、动画与过渡标准

### Transition Name 体系

| Transition Name | 用途 | 时长 | 缓动函数 |
|----------------|------|------|----------|
| `dropdown` | 下拉菜单展开收起 | 0.25s / 0.2s | ease / ease-out |
| `fade` | 淡入淡出（提示条等） | 0.4s | ease |
| `select-dropdown` | 自定义下拉选择 | 0.2s out / 0.15s in reverse | ease-out / ease-in |
| `dialog-fade` | Dialog弹框 | 0.3s out / 0.2s in | ease-out / ease-in |
| `toast-fade` | Toast提示 | 0.4s | ease-out / ease-in |

### 自定义动画 keyframes 体系

| 动画名 | 用途 | 详情 |
|--------|------|------|
| `fadeIn` | 弹框蒙层出现 | 0→1 opacity, 0.2s ease-out |
| `scaleIn` | 弹框内容出现 | scale(0.95→1) + opacity(0→1), 0.2s ease-out |
| `float` | 粒子浮动 | translateY(-20px) + scale(1.2), 5s ease-in-out infinite |
| `dropdownIn` | 下拉面板展开 | translateY(-8px) + scale(0.97→1) + opacity, 0.2s |
| `selectDropdownIn` | 选择下拉面板 | 同上 |
| `dialog-zoom-in` | Dialog蒙层出现 | opacity 0→1, 0.3s |
| `dialog-scale-in` | Dialog内容出现 | scale(0.9→1) + opacity, 0.3s |
| `dialog-scale-out` | Dialog内容消失 | scale(1→0.9) + opacity, 0.2s |
| `spin` | 加载旋转动画 | rotate 360deg, 0.8s linear infinite |

### Vue Transition 用法模式

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
| 卡片/元素 hover 变换 | `0.3s` | `ease` |
| 按钮 hover | `0.25s` | `ease` |
| 表单输入 focus | `0.2s` | `ease` |
| 选项 hover | `0.15s` | `ease` |

---

## 十一、Loading 状态

```css
/* 居中加载 */
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  color: #888;
  font-size: 14px;
}

/* 旋转 Spinner */
.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid rgba(102, 126, 234, 0.15);
  border-top-color: #667eea;
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
  color: #888;
  font-size: 14px;
  gap: 8px;
}
```

---

## 十三、组件容器通用样式

Dashboard 子组件容器（Component2/3）:
```css
.component-container {
  background: rgba(249, 249, 249, 0.85);
  border-radius: 12px;
  padding: 24px;
  margin: 16px;
  min-height: calc(100% - 32px);
}
```

简单内容组件（Component1/4）:
```css
.component-content {
  padding: 24px;
}
```

---

## 十四、Topbar 标准

共享 `src/style/o-topbar1.css`，所有页面顶部导航栏统一：
```
背景: rgba(255, 255, 255, 0.7); backdrop-filter: blur(10px)
底部边框: 1px solid rgba(59, 130, 246, 0.1)
z-index: 10

内容区: max-width: 1400px; margin: 0 auto; padding: 16px 0

Logo: font-size: 25px; font-weight: 700; color: #64748b

导航链接:
  color: #64748b; font-size: 15px; text-decoration: none
  ::after: bottom underline 2px, hover时 width: 0→100%
  hover: color: #3b82f6
```

---

## 十五、侧边栏标准

```
width: 200px; flex-shrink: 0
background: rgba(249, 249, 249, 0.85); backdrop-filter: blur(10px)
border-right: 1px solid rgba(59, 130, 246, 0.1)

链接:
  padding: 14px 16px (padding-left: 28px)
  color: #64748b; font-size: 16px; font-weight: 500
  border-radius: 8px
  transition: all 0.3s ease
  hover:   background: rgba(59, 130, 246, 0.08); color: #3b82f6
  active:  background: rgba(59, 130, 246, 0.12); color: #3b82f6
```

---

## 十六、CSS 变量提案（未来迁移目标）

建议逐步统一引入 CSS 变量，目标如下：

```css
:root {
  /* Primary */
  --clr-primary: #3b82f6;
  --clr-primary-dark: #2563eb;
  --clr-primary-light: #60a5fa;
  --clr-primary-bg: rgba(59, 130, 246, 0.08);
  --clr-primary-active: rgba(59, 130, 246, 0.12);

  /* Accent */
  --clr-accent: #667eea;
  --clr-accent-bg: rgba(102, 126, 234, 0.08);
  --clr-accent-active: rgba(102, 126, 234, 0.12);

  /* Text */
  --clr-text-heading: #1a1a2e;
  --clr-text-body: #333;
  --clr-text-secondary: #666;
  --clr-text-muted: #888;
  --clr-text-light: #64748b;

  /* Background */
  --bg-page: linear-gradient(135deg, #e8f4fc 0%, #d4ecf7 50%, #f0f7fc 100%);
  --bg-container: rgba(249, 249, 249, 0.85);
  --bg-card: #fff;
  --bg-overlay: rgba(0, 0, 0, 0.4);
  --bg-overlay-light: rgba(240, 245, 250, 0.85);

  /* Border */
  --border-card: 1px solid rgba(0, 0, 0, 0.06);
  --border-input: 1px solid rgba(0, 0, 0, 0.12);
  --border-divider: #f0f0f0;

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
