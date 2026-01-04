# Image Editor Clone (Nano Banana)

一个基于 Next.js App Router 的「文本驱动图片编辑」Demo：上传图片 + 输入自然语言 prompt，由服务端调用 OpenRouter 的多模态模型生成编辑后的图片（以及可选文本说明）。

## 功能概览

- Supabase Auth（服务器端认证 / PKCE）：Google、GitHub 登录
- 登录保护：未登录会被重定向到 `/login`，登录后才能使用编辑与接口
- 图片生成：`POST /api/generate`（需要登录）
- 用量统计：每日生成次数配额（默认 3 次/天，可配置）
  - 查询：`GET /api/usage`
  - 生成接口会在成功前写入计数（见下方“数据库表”）

## 路由一览

- 页面
  - `/`：主页面（需要登录）
  - `/login`：登录页（Google / GitHub）
- Auth（server routes）
  - `POST /auth/sign-in`：发起 OAuth（provider=google|github）
  - `GET /auth/callback`：OAuth 回调（exchange code -> session）
  - `POST /auth/sign-out`：登出
- API
  - `POST /api/generate`：生成图片（需要登录 + 配额检查）
  - `GET /api/usage`：查询当日配额使用情况（需要登录）

## 环境变量

复制 `.env.example` 为 `.env.local`，并填写：

```bash
# OpenRouter
OPENROUTER_API_KEY=...

# Quota (可选，默认 3)
DAILY_GENERATION_LIMIT=3

# Supabase
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

注意：`.env.local` 会被 `.gitignore` 忽略，不要提交。

## Supabase 配置

### 1) 开启 OAuth Providers

在 Supabase Dashboard：

- Auth -> Providers -> Google：启用并填写 Client ID/Secret
- Auth -> Providers -> GitHub：启用并填写 Client ID/Secret

### 2) 配置 Redirect URLs

在 Supabase Dashboard：

- Auth -> URL Configuration
  - 添加 `http://localhost:3000/auth/callback`
  - 生产环境再添加你的正式域名回调，例如 `https://your-domain.com/auth/callback`

### 3) 在 Google / GitHub OAuth 平台配置回调

两者都需要把回调配置指向 Supabase 的统一回调地址：

```text
https://<your-project-ref>.supabase.co/auth/v1/callback
```

## 数据库表（用于配额统计）

项目会读写 `generation_usage` 表来实现每日配额。你需要在 Supabase SQL Editor 里创建：

```sql
create table if not exists public.generation_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  day text not null,
  count int not null default 0,
  primary key (user_id, day)
);

alter table public.generation_usage enable row level security;

create policy "read own usage"
on public.generation_usage
for select
to authenticated
using (auth.uid() = user_id);

create policy "insert own usage"
on public.generation_usage
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "update own usage"
on public.generation_usage
for update
to authenticated
using (auth.uid() = user_id);
```

说明：

- `day` 使用 UTC 日期键（`YYYY-MM-DD`）。
- “每日窗口”以用户 `last_sign_in_at`（UTC 时间）为边界按 24 小时滚动计算（实现见 `lib/generation-limit.ts`）。

## 本地开发

推荐使用 pnpm（仓库有 `pnpm-lock.yaml`）：

```bash
corepack pnpm install
corepack pnpm dev
```

生产构建：

```bash
corepack pnpm build
corepack pnpm start
```

Windows（PowerShell）如果遇到 `npm.ps1` 执行策略限制，可用 `cmd /c "npm run dev"` 作为替代。

## 实现要点

- Supabase SSR 客户端：
  - `lib/supabase/server.ts`（Server Components / Route Handlers）
  - `lib/supabase/client.ts`（浏览器侧）
- 登录保护：
  - Next.js 16 使用 `proxy.ts` 实现全局保护（类似旧版 `middleware.ts`）
- 生成接口鉴权与配额：
  - `app/api/generate/route.ts`
  - `app/api/usage/route.ts`

