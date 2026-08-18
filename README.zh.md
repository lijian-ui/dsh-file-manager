# dsh-file-manager — DSH Web GUI 右侧文件管理面板 + `@` 文件引用

[English](README.md) | 中文

> 为 DeepSeek Harness 桌面端（`dsh web`）开发的插件：聊天区右侧的 **Explorer 文件面板 + Preview 预览面板**（FileManager 风格，Apache-2.0 参考实现非抄录），以及输入框 **`@` 引用项目文件**（树形多选弹窗 + 输入框内胶囊 + 行号）。数据全部来自真实文件系统与真实 git 仓库，无 mock。

## 功能

### 右侧面板

- **Explorer（最右栏）**：`文件 / 变更` 双 tab。
  - 文件树：整行点击展开/收起目录、打开文件；顶部文件名搜索（150ms 防抖，点击结果定位到树）。
  - Git 变更：读取真实 git status（porcelain v1 -z），支持 stage / unstage / discard（untracked 走删除、tracked 走 restore，批量放弃有确认）。
  - 文件树右键菜单：复制路径、复制名称、在文件管理器中显示、用默认应用打开、重命名、新建文件、新建文件夹、删除（二次确认）。
  - 拖拽文件行到聊天输入框，即把相对路径插入草稿。
- **Preview（右二栏）**：多 tab 预览，支持 markdown / html / code / diff / csv / pdf / word / excel / ppt / 图片 / 文本 / url。源码/预览切换、分屏编辑（比例持久化）、保存（mtime 冲突检测）、下载、刷新、中键关闭、右键批量关闭。
- **Mermaid 图表**：markdown 预览中的 ```mermaid 代码块渲染为图表，运行时打包在插件内（同源提供、离线可用、跟随主题）。
- 明暗主题跟随、偏好按项目隔离持久化、总开关（设置 → Web UI 插件）。

### `@` 文件引用（重点）

在聊天输入框输入 `@` 打开 **pi-desktop 风格树形多选弹窗**（懒加载目录树 + 文件名搜索 + 复选框多选）：

- 选中文件/目录 → 输入框内出现**胶囊**（绿色 `</>` 图标 + 文件名 + 行号），引用文字隐藏，发送时才还原为 `@相对路径:行号` 纯文本发给模型。
- **行号**：文件引用自动携带整个文件的行数（`@path:1-N`）；在预览面板**选中代码片段**再点「添加到对话」，胶囊只携带选中区域的行号（`@path:start-end`）。
- 胶囊是 dsh 原生引用对象（非文字装饰）：Backspace 整删、复制/粘贴保留语义、发送时经插件注册的 `file` 引用 codec 序列化。
- 目录引用为 `@路径/` 纯文本（目录无行号概念）。

## 安装

```sh
# 从 npm（发布后）
dsh plugin --profile web add @lijian-ui/dsh-file-manager

# 从仓库直接 link（开发/联调，clone 即可用，lib 已构建入库）
git clone https://github.com/lijian-ui/dsh-file-manager.git
cd dsh-file-manager
dsh plugin --profile web add link:$(pwd)
```

安装后**重启 `dsh web`**，打开项目会话即可看到聊天区右侧面板；在输入框输入 `@` 体验文件引用。

> 桌面壳（dsh-desktop）开发期以本地 symlink 联调：`node_modules/@lijian-ui/dsh-file-manager → extensions/file-manager`，源码改动后 `npm run build` 重新生成 `lib/`，重启 dev 生效。

## 架构

- **host 半区**（`src/index.ts` + `src/host/`）：cordis 插件，经 `/filemgr/*` HTTP 路由提供目录列举、文件读取（文本 80k 字符上限 / 图片 data URL）、写入（mtime 冲突检测）、文件名搜索、git status / stage / unstage / discard、SSE 变更流；所有操作过**工作区门卫**（realpath 规范化 + 前缀校验）且**仅限 loopback**。
- **browser 半区**（`src/client/`）：框架无关状态核心（`store.ts`）、拖拽引擎（`drag.ts`）、DOM 布局控制器（`layout.ts`，向 shell 三栏 grid 追加面板轨道）、React 组件（explorer / scm / preview / picker）。
  - `picker/FilePickerModal.tsx` — `@` 树形多选弹窗（bridge + modal，监听输入框裸 `@` 打开）。
  - `file-source.ts` — 注册 `file` 输入触发 source（仅提供引用 codec，惰性菜单参与者）。
  - `reference.ts` — 引用胶囊插入（`slash/input-insert-reference` bail，`@path:lines` 序列化）。
  - `preview/selection.ts` — 预览选区 → 行号区间换算。
  - `styles/chip.module.css` — 胶囊视觉（浅灰圆角 + 绿色 `</>` 图标，全局覆盖 `[data-decoration="chip"]`）。
- **工作流约定**：改插件后必须 `npm run build`（重生成 `lib/`）再重启 dev，二者缺一不可。

## 构建

```sh
npm install
npm run build      # tsc -b + tsdown → lib/
npm run test       # vitest
```

## 署名

本项目是 FileManager（iOfficeAI/FileManager，Apache-2.0）右侧面板系统的复刻实现：尺寸、颜色、动效、交互参数来自对 v2.1.53 的实测调研，实现为全新代码，未大段抄录源码。上游版权归 FileManager 项目所有，本项目按 Apache-2.0 约定保留署名。
