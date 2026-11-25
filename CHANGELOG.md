# Changelog

All notable changes to **MarkTextPro** are documented in this file.

## [1.3.3] - 2026-11-25

### ✨ Features & Improvements
- **工作区统一管理弹窗 / Unified Switch Workspace Modal**：
  - 将“切换 Git 工作区”升级为“**切换工作区**”，同屏展示当前工作区（排在首位并默认选中）、Git 工作区列表与历史工作区列表，并支持直接选择 Windows / macOS / Linux 系统本地文件夹。
  - 自动检测工作区目录存在性：对已删除路径标记“**工作区已被删除**”，仍允许选中并在切换时自动重建目录；非 Git 历史工作区支持悬停提示“移除该工作区历史记录”并仅清理历史记录而不删除磁盘文件夹。
  - 新增键盘交互支持：`ArrowUp` / `ArrowDown` 循环切换选中项并自动滚动定位，`Enter` 直接确认切换。
- **工作区智能迁移合并 / Workspace Migration Workflow**：
  - 无 Git 非空原工作区切换至 Git 工作区时自动弹窗询问，默认勾选并首位展示“**不迁移**”（*不迁移原工作区数据，仅切换工作区*），其次为“跳过”与“覆盖”；当目标工作区同样无 Git 时跳过提示直接切换。
  - 从侧边栏手动触发“合并其他工作区至此工作区”时隐藏“不迁移”选项，默认“跳过（默认推荐）”，源目录改为纯手动浏览选择不预填默认值。
- **GitHub 视图与多语言体验增强 / GitHub Desktop UX & i18n**：
  - 修复在 GitHub 视图下弹出“切换 / 迁移工作区”与“设置为工作区”弹窗被 `BrowserView` 遮挡及 Toast 被截断的问题；点击“设置为工作区”精简为“确定 / 取消”并修复确定后立即切换生效与完整分支切换链路。
  - 在“偏好设置 → 通用”重新选择工作区目录后，即时刷新并切换当前主窗口工作区（保留强制重载 `forceReload` 支持）。
  - 修复 GitHub 视图下摘要与描述输入框的复制、粘贴、剪切、全选、撤销/重做快捷键路由；补全提交按钮（如 `Commit N files to main`）与文件变更操作（`Create / Delete / Update`）等 11 国语言动态翻译。

## [1.3.2] - 2026-11-25

### ✨ Features & Improvements
- **局域网零配置分享（LAN Share）/ Zero-Config LAN File Sharing**：
  - 新增本地文件与工作区局域网一键分享能力与标准二维码展示，支持 11 种语言界面适配。
  - 升级在线 Markdown 阅读器为完整 GFM 解析器（支持任务列表与表格渲染）。
  - 新增“无密码快速分享”快捷按钮并修复侧边栏 Tooltip 与分享弹窗多语言细节。

### 🐛 Bug Fixes
- **Draw.io 编辑器**：修复手动保存与自动保存期间丢失当前文字选区与光标位置的问题。

## [1.3.1] - 2026-11-23

### ✨ Features & Improvements
- **KDBX 密码库**：新增自动锁定倒计时显示，并支持主密码中的特殊字符。

### 🐛 Bug Fixes
- **文件标签页**：修复 MarkTextPro 顶部标签页未完整显示带扩展名文件名的问题。
- **KDBX 密码库**：在解锁时快照固定自动锁定超时时长，防止会话期间修改偏好设置意外延长已解锁会话。
- **桌面贴图 / Mermaid**：修复 macOS 下 Mermaid 图表弹出贴图失败的问题。

## [1.3.0] - 2026-11-20

### 🐛 Bug Fixes & Security
- **GitHub 认证**：启用独立的 MarkTextPro GitHub OAuth 应用及专属回调协议（`marktextpro-github-auth://`），修复内置 Git 登录授权问题。

## [1.2.9] - 2026-11-20

### ✨ Features & Improvements
- **Markdown 编辑器**：支持有序列表换行自动延续编号，并支持自定义起始序号重启编号。

## [1.2.8] - 2026-11-18

### 🐛 Bug Fixes
- **终端与 SSH**：修复 Windows 和 Linux 下的终端重复粘贴问题，恢复粘贴功能并将终端快捷键限制在终端聚焦状态下触发；为 Electron SSH 连接补充 `chacha20-poly1305` 加密算法回退兼容。
- **KDBX 密码库**：修复右键上下文菜单超出视口边界问题，并适配动态传送菜单的主题文字颜色。
- **视图快捷键**：修复 `Command+K` 触发 `toggleLayout` 在打包时被 Tree-Shaking 移除的问题。

## [1.2.7] - 2026-11-08

### ✨ Features & Improvements
- **图片悬停快捷贴图**：支持正文行内图片悬停直接弹出贴图按钮（样式与 Mermaid 保持一致），支持脱离编辑工具栏自动追踪以及将贴图保存至工作区附件目录。

### 🐛 Bug Fixes
- **跨屏与输入体验**：修复全屏模式下跨 Space 切换与交通灯按钮丢失问题，确保输入法（IME）候选词与批注点击停留在当前桌面空间；修复行内图片 `eventCenter` 引用问题。
- **贴图样式与剪贴板**：适配水印颜色与主题样式，修复浅色模式下标签缺口与文字颜色，编辑态标签文本同步应用所选色值，并在工具栏色块增加勾选状态标识；修复剪贴板历史“清空全部”确认按钮默认红色背景。

## [1.2.6] - 2026-11-03

### ✨ Features & Improvements
- **截图、桌面贴图与剪贴板历史**：完整迁移集成屏幕截图、桌面贴图（Pin）与剪贴板历史能力（在热点与通道优先级上礼让 MarkNotePro）。
- **macOS 权限与签名**：完善 macOS Entitlements 与屏幕录制/辅助功能权限描述，采用稳定 Designated Requirement 签名保留 TCC 永久授权并消除重叠权限弹窗。

### 🐛 Bug Fixes
- **窗口焦点与多屏体验**：恢复 macOS 活动窗口完整焦点、消除失焦闪烁并修复 Dock 激活响应；防止辅助窗口（截图/贴图/剪贴板）关闭或复制时误切换桌面空间；修复设置面板异常与 Windows 下贴图光标不可见、底部边框裁剪问题。

## [1.2.4] - 2026-10-20

### ✨ Features & Improvements
- **Mermaid 与排版**：支持 Mermaid 图表拖拽平移与缩放，优化编辑器响应式排版宽度。
- **发布流程**：精简并规范双语 Release 说明模板。

## [1.2.3] - 2026-10-16

### ✨ Features & Improvements
- **界面交互**：优化 Git 视图顶部工具栏工作区动态提示，并恢复上栏搜索按钮 Tooltip。
- **自动化同步与文档**：新增 GitHub 向 Gitee 自动镜像同步代码、Tag 与 Release 的 CI 流水线；新增英文版 `README_en.md`，完善双语 Release 说明模板、关联仓库链接及百度网盘下载入口。

## [1.2.0] - 2026-10-16

### ✨ Features & Improvements
- **内置 PDF 阅读器与全语言适配**：集成 PDF 阅读器，支持 `Cmd+S / Ctrl+S` 原地保存与明暗主题自适应，修复语言竞态并实现完整多语言实时重译；注册 `.txt` / `.text` / `.pdf` 全平台文件关联。
- **Git 与工具栏交互升级**：对齐 MarkNotePro 多模态能力基线；使用 GitHub 图标与“Git 管理 / 返回工作区”全语言提示，优化即时 Tooltip 与亮暗主题视觉；移除上栏多余 Tooltip。

### 🐛 Bug Fixes & Security
- **设置面板与安全加固**：修复设置面板异常；清洗 `BrowserLauncher.java` 子进程调用（PR #1 / CWE-78）；校准 16 位 KDBX 主密码建议与私有 Git 仓库安全规范。
