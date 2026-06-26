# 本地开发环境配置指南

本文档供开发者及 AI agent 阅读，说明如何在本地跑起 Viby。
所有密钥只存在于本地 `.env.local`（已被 `.gitignore` 忽略），不会进入版本库。

## 1. 前置依赖

- Node.js 18+（项目使用 22.x）
- 一个 Supabase 项目（免费档即可）

## 2. Supabase 配置

### 2.1 获取凭证

登录 [Supabase Dashboard](https://supabase.com/dashboard)，打开你的项目，进入
**Project Settings → API**，复制以下两个值：

| 变量 | 在 Dashboard 中的位置 |
|------|----------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL，形如 `https://xxxxxxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Project API keys → `anon` `public`（注意不是 `service_role`） |

> `anon` key 是公开密钥，安全性由 RLS（行级安全）保证，可以暴露在前端。
> `service_role` key 可绕过 RLS，**绝对不要**放进任何 `NEXT_PUBLIC_` 变量或提交到仓库。

### 2.2 写入本地环境变量

编辑项目根目录的 `.env.local`（已存在占位模板，被 gitignore）：

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...你的 anon key...
```

### 2.3 执行数据库迁移

在 Supabase Dashboard → **SQL Editor** 中，依次粘贴并运行以下两个文件的内容：

1. `supabase/migrations/0001_init.sql` — 创建 profiles / credit_ledger / projects / creative_briefs 表与 RLS 策略
2. `supabase/migrations/0002_core_schema.sql` — 对齐 spec v2.2：scripts / scenes / shots / assets / storyboards 表与 RLS

> 两个文件按顺序运行即可，第二条依赖第一条创建的 `projects` 表。

### 2.4 开启邮箱登录

Supabase Dashboard → **Authentication → Providers → Email**，确保已启用。
本地开发建议关闭 "Confirm email"，否则注册后需要去邮箱点确认链接才能登录。

### 2.5 创建 Storage Bucket

Supabase Dashboard → **Storage**，新建一个 **Public** bucket，名为 `project-assets`。
用于存放用户上传/生成的参考图。

> ⚠️ 安全提示：当前 V1 使用 public bucket，知道 URL 即可访问图片。
> 生产环境建议改为 private bucket + 签名 URL。

## 3. 可选：Viby 托管 AI

如果你想让 "Viby 托管" 模式可用（否则用户只能用 BYOK 自带 Key），在 `.env.local` 填入 OpenAI 兼容接口：

```bash
VIBY_AI_BASE_URL=https://api.openai.com/v1
VIBY_AI_API_KEY=sk-...
VIBY_AI_TEXT_MODEL=gpt-4o
VIBY_AI_IMAGE_MODEL=gpt-image-2
```

不填这两项时，新用户注册后无法消耗 Credit 体验托管生成，需在设置页切到 BYOK。

## 4. 启动

```bash
npm install
npm run dev
```

访问 http://localhost:3000

## 5. 安全约定

| 文件 | 是否提交 | 说明 |
|------|---------|------|
| `.env.example` | ✅ 提交 | 仅含变量名占位，无真实值 |
| `.env.local` | ❌ 不提交 | 本地真实凭证，已被 gitignore |
| `docs/local-dev-setup.md` | ✅ 提交 | 本文档，供任何 agent / 开发者阅读 |

如果密钥不慎泄露，请立即在 Supabase Dashboard 重置 API key。
