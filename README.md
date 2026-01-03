# Nano Banana（image-editor-clone）

一个基于 Next.js App Router 的「文本驱动图片编辑」Demo：上传一张图片 + 输入自然语言提示词（prompt），由服务端调用 OpenRouter 的多模态模型生成编辑后的图片（以及可选文本说明）。

## 项目目标（设计方案）

### 产品定位
- 面向非专业用户的轻量图片编辑入口：不提供复杂的图层/画笔工具，而是用一句话完成“换背景/加物体/改风格/补全”等编辑需求。
- 以“1 张输入图 + 1 段 prompt → N 张输出图”为核心闭环，并保留扩展到多图上下文、版本历史、下载分享等能力的空间。

### 核心体验流程
1. 用户上传图片（浏览器本地预览，限制最大 10MB）。
2. 输入编辑意图 prompt（必填）。
3. 点击生成：前端以 `multipart/form-data` 提交到 `POST /api/generate`。
4. 服务端将图片转成 `data:` URL（base64）并调用 OpenRouter 上游模型。
5. 返回 `images[]`（可能为 `data:` URL 或远端 URL）与 `text`，前端渲染结果列表并展示错误状态。

## 功能清单（现状）
- 上传图片并在页面中预览（前端校验文件大小）。
- 输入 prompt 触发生成，展示加载状态与错误提示。
- 展示模型返回的多张图片结果（若为空会提示用户换 prompt）。
- 服务端透传并解析上游响应：同时支持从 `message.images` 与 `message.content`（含 data URL）提取图片。

## 技术架构

### 前端（`/app`）
- Next.js App Router 单页入口：`app/page.tsx`（客户端组件）负责上传、prompt 输入、发起请求、渲染结果。
- UI：shadcn/ui + Radix + Tailwind CSS（Tailwind v4）。
- 状态：组件内 `useState`（`selectedFile`、`prompt`、`generatedImages`、`isGenerating`、`error` 等）。

### 后端（`/app/api/generate`）
- 路由：`app/api/generate/route.ts`（`runtime = "nodejs"`）。
- 入参：`FormData`（`prompt: string`，`image: Blob`）。
- 处理：将图片转为 base64 的 `data:` URL，调用 OpenRouter `chat/completions` 多模态接口。
- 出参：`{ images: string[]; text: string }` 或 `{ error: string }`。

### 上游依赖
- OpenRouter：通过 `OPENROUTER_API_KEY` 调用 `https://openrouter.ai/api/v1/chat/completions`。
- 默认模型：`google/gemini-2.5-flash-image`（可在 `app/api/generate/route.ts` 中替换）。

## 接口约定

### `POST /api/generate`
**请求**
- `Content-Type: multipart/form-data`
- 字段：
  - `prompt`：必填
  - `image`：必填（Blob/File）

**响应**
- `200 OK`：`{ images: string[]; text: string }`
- `400`：表单错误（缺 prompt 或 image）
- `500`：缺少服务端配置（如未设置 `OPENROUTER_API_KEY`）
- `502`：上游错误/返回不符合预期

## 配置

在根目录创建 `.env.local`（不要提交）：

```bash
OPENROUTER_API_KEY=your_key_here
```

## 本地开发

推荐使用 pnpm（仓库包含 `pnpm-lock.yaml`）：

```bash
pnpm install
pnpm dev
```

生产构建：

```bash
pnpm build
pnpm start
```

Windows（PowerShell）提示：如果遇到 `npm.ps1` 执行策略限制，可改用 `cmd /c "npm run build"` 或调整本机 ExecutionPolicy。

## 目录结构
- `app/`：App Router 页面与接口路由（`app/api/generate`）。
- `components/`：共享组件（`components/ui/` 为 shadcn/ui）。
- `hooks/`：通用 hooks。
- `lib/`：工具函数。
- `public/`：静态资源。

## 风险与约束（设计取舍）
- 图片以 base64 形式上送：实现简单，但会增加请求体积；后续可改为直传对象存储 + 传 URL。
- Next 配置当前跳过 TS 校验（`next.config.mjs`）：便于快速迭代，但正式化前建议恢复类型检查。
- 结果图片来源不一：可能为 `data:` URL 或远端 URL；渲染与下载逻辑需要同时兼容。

## Roadmap（建议）
- 历史记录：保存 prompt/输入图/输出图版本（本地存储或数据库）。
- 下载与分享：一键下载生成图、生成分享链接。
- Prompt 模板：常用编辑意图的预设与参数化。
- 成本与限流：为 `POST /api/generate` 增加鉴权、速率限制与用量统计。
