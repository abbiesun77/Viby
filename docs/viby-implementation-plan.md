# Viby V1 实现计划

> 依据：viby-spec-v2.2.md · viby-design-spec-for-prototype.md  
> 架构：Next.js 14 App Router · Supabase Auth/Postgres/Storage · Tailwind CSS · Vitest · Playwright

---

## 现有代码状态

已完成，可复用：
- 认证流程（sign-in / sign-up / middleware）
- Supabase 客户端封装（browser / server / middleware）
- Landing page（marketing 组件）
- 项目骨架（Next.js 路由结构、globals.css）

需重写或新建：
- 工作区主体（三步 Tab + Dashboard）
- 所有 AI 调用逻辑
- Storyboard 合成图生成
- 导出 ZIP

---

## 数据模型总览

```
profiles          用户档案 + Credit 余额
projects          项目主表（entry_mode, workflow_state）
scripts           剧本全文
scenes            场景（属于 project）
shots             分镜卡（属于 scene）
assets            参考图资产（属于 project）
storyboards       每场景合成图（属于 scene）
credit_ledger     Credit 消耗记录
```

---

## Task 1：数据库 Schema

**目标：** 建立全部核心表，支撑后续所有功能。

### 文件
- `supabase/migrations/0002_core_schema.sql`

### SQL

```sql
-- projects
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  entry_mode text not null check (entry_mode in ('idea', 'script')),
  workflow_state text not null default 'onboarding'
    check (workflow_state in ('onboarding','script','scenes','storyboard','done')),
  style text,
  duration text,
  mood text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- scripts
create table public.scripts (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  content text not null,
  confirmed_at timestamptz,
  created_at timestamptz not null default now()
);

-- scenes
create table public.scenes (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  scene_number integer not null,
  title text not null,
  created_at timestamptz not null default now()
);

-- shots
create table public.shots (
  id uuid primary key default gen_random_uuid(),
  scene_id uuid not null references public.scenes(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  shot_number integer not null,
  framing text,
  subject text,
  action text,
  mood text,
  created_at timestamptz not null default now()
);

-- assets
create table public.assets (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  asset_type text not null check (asset_type in ('character','scene','prop','style')),
  name text not null,
  description text,
  image_url text,
  status text not null default 'missing' check (status in ('missing','generated','uploaded')),
  priority text not null default 'suggested' check (priority in ('required','suggested')),
  created_at timestamptz not null default now()
);

-- storyboards
create table public.storyboards (
  id uuid primary key default gen_random_uuid(),
  scene_id uuid not null references public.scenes(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  grid_size integer not null default 16,
  aspect_ratio text not null default '16:9',
  image_url text,
  prompt text,
  status text not null default 'pending' check (status in ('pending','generating','done','failed')),
  created_at timestamptz not null default now()
);

-- RLS
alter table public.projects      enable row level security;
alter table public.scripts       enable row level security;
alter table public.scenes        enable row level security;
alter table public.shots         enable row level security;
alter table public.assets        enable row level security;
alter table public.storyboards   enable row level security;

-- RLS policies (user owns their data)
create policy "owner" on public.projects      using (user_id = auth.uid());
create policy "owner" on public.scripts       using (project_id in (select id from public.projects where user_id = auth.uid()));
create policy "owner" on public.scenes        using (project_id in (select id from public.projects where user_id = auth.uid()));
create policy "owner" on public.shots         using (project_id in (select id from public.projects where user_id = auth.uid()));
create policy "owner" on public.assets        using (project_id in (select id from public.projects where user_id = auth.uid()));
create policy "owner" on public.storyboards   using (project_id in (select id from public.projects where user_id = auth.uid()));
```

### 验收
- 运行迁移无报错
- 所有表有 RLS 策略

---

## Task 2：AI 路由层

**目标：** 统一封装文字生成和图片生成，支持 Viby Credit 和 BYOK 两种模式。

### 文件
- `src/lib/ai/client.ts`
- `src/lib/ai/prompts.ts`
- `src/lib/ai/credits.ts`

### `src/lib/ai/client.ts`

```ts
export type AiMode = "viby" | "byok";

export interface AiConfig {
  mode: AiMode;
  byokBaseUrl?: string;
  byokApiKey?: string;
}

export async function generateText(
  prompt: string,
  config: AiConfig
): Promise<string> {
  const { baseUrl, apiKey } = resolveEndpoint(config);
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) throw new Error(`AI text error: ${res.status}`);
  const data = await res.json();
  return data.choices[0].message.content as string;
}

export async function generateImage(
  prompt: string,
  config: AiConfig
): Promise<string> {
  const { baseUrl, apiKey } = resolveEndpoint(config);
  const res = await fetch(`${baseUrl}/images/generations`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model: "gpt-image-1", prompt, n: 1, size: "1792x1024" }),
  });
  if (!res.ok) throw new Error(`AI image error: ${res.status}`);
  const data = await res.json();
  return data.data[0].url as string;
}

function resolveEndpoint(config: AiConfig) {
  if (config.mode === "byok") {
    if (!config.byokBaseUrl || !config.byokApiKey)
      throw new Error("BYOK requires base URL and API key");
    return { baseUrl: config.byokBaseUrl, apiKey: config.byokApiKey };
  }
  return {
    baseUrl: process.env.VIBY_AI_BASE_URL!,
    apiKey: process.env.VIBY_AI_API_KEY!,
  };
}
```

### `src/lib/ai/credits.ts`

```ts
export const COSTS = {
  script_generation: 5,
  scene_generation: 10,
  asset_generation: 20,
  storyboard_generation: 20,
} as const;

export type CreditAction = keyof typeof COSTS;

export function costOf(action: CreditAction) {
  return COSTS[action];
}
```

### `src/lib/ai/prompts.ts`

```ts
export function buildScriptPrompt(idea: string, style: string, duration: string, mood: string) {
  return `你是一位专业编剧助手。根据以下输入，写一份简洁的中文视频剧本（${duration}），风格${style}，情绪基调${mood}。

用户想法：${idea}

要求：
- 分场景，每个场景用 == 场景 N：标题 == 格式标注
- 每场景写2-4句画面描述，不需要台词
- 剧本总长度适合${duration}的视频
- 语言简洁，重点描述画面`;
}

export function buildScenePrompt(script: string) {
  return `根据以下剧本，提取场景列表和每个场景的分镜描述。

剧本：
${script}

以 JSON 格式返回，结构如下：
{
  "scenes": [
    {
      "scene_number": 1,
      "title": "场景标题",
      "shots": [
        {
          "shot_number": 1,
          "framing": "景别/角度",
          "subject": "画面主体",
          "action": "动作/内容",
          "mood": "情绪/氛围"
        }
      ]
    }
  ]
}`;
}

export function buildAssetGapPrompt(script: string) {
  return `分析以下剧本，列出需要参考图的角色、场景和道具。

剧本：
${script}

以 JSON 格式返回：
{
  "assets": [
    {
      "asset_type": "character|scene|prop|style",
      "name": "名称",
      "description": "描述",
      "priority": "required|suggested"
    }
  ]
}`;
}

export function buildStoryboardPrompt(
  sceneTitle: string,
  shots: { framing: string; subject: string; action: string; mood: string }[],
  gridSize: number,
  aspectRatio: string
) {
  const shotDescriptions = shots
    .map((s, i) => `镜头${i + 1}：${s.framing}，${s.subject}，${s.action}，${s.mood}`)
    .join("\n");
  return `为电影分镜图生成 ${gridSize} 格 storyboard 合成图，画面比例 ${aspectRatio}。

场景：${sceneTitle}
分镜描述：
${shotDescriptions}

要求：
- 黑白铅笔线稿风格
- ${gridSize} 个格子排列在一张图内
- 每格对应一个镜头，按顺序排列
- 格子间有明显分隔线
- 每格右下角标注镜号`;
}
```

---

## Task 3：项目创建 & Onboarding 入口（S04 + S05）

**目标：** 用户注册后看到引导入口，完成三问对话并创建项目。

### 文件
- `src/app/(workspace)/app/page.tsx` — 改为重定向到 onboarding 或项目列表
- `src/app/(workspace)/app/new/page.tsx` — 入口选择页（S04）
- `src/components/onboarding/entry-selector.tsx` — 两个路径卡片
- `src/components/onboarding/chat-guide.tsx` — 聊天气泡引导组件（client）
- `src/app/api/projects/route.ts` — 创建项目 + 触发剧本生成

### 路由逻辑
```
/app          → 有项目：项目列表；无项目：跳转 /app/new
/app/new      → S04 入口选择
/app/new 提交 → POST /api/projects → 返回 projectId → 跳转 /app/projects/[id]
```

### `entry-selector.tsx` 结构
```tsx
// 两个路径卡片 + 输入框展开 + 开始按钮
// 路径 A: entry_mode="idea", 显示三问引导
// 路径 B: entry_mode="script", 直接跳过 Tab 1
```

### `chat-guide.tsx` 结构
```tsx
// 三个问题步骤：style → duration → mood
// 每步渲染：Viby气泡 + 选项芯片 or 自由输入框
// 全部回答后：调用 /api/projects 创建项目 + 生成剧本
// loading 态显示"Viby 正在生成剧本..."气泡
```

### API `POST /api/projects`
```ts
// body: { entry_mode, title, raw_input, style?, duration?, mood? }
// 1. 创建 projects 记录
// 2. 如 entry_mode==="idea": 调用 generateText(buildScriptPrompt(...)) 生成剧本
//    扣除 script_generation credit
//    插入 scripts 记录，workflow_state="script"
// 3. 如 entry_mode==="script": 直接插入 scripts，跳到场景生成
//    workflow_state="scenes"
// 返回: { projectId, workflowState }
```

### 验收
- [ ] 路径 A：完成三问 → 创建项目 → 跳转剧本 Tab
- [ ] 路径 B：粘贴剧本 → 创建项目 → 跳转场景 Tab（跳过剧本 Tab）
- [ ] Credit 余额更新

---

## Task 4：工作区三步 Tab 骨架

**目标：** 建立三步 Tab 布局，支持顺序解锁和随时重入。

### 文件
- `src/app/(workspace)/app/projects/[projectId]/layout.tsx` — Tab 布局
- `src/components/workspace/tab-nav.tsx` — Tab 导航栏
- `src/app/(workspace)/app/projects/[projectId]/script/page.tsx`
- `src/app/(workspace)/app/projects/[projectId]/scenes/page.tsx`
- `src/app/(workspace)/app/projects/[projectId]/storyboard/page.tsx`

### Tab 解锁逻辑
```ts
// 从 projects.workflow_state 推导：
// "script"     → Tab 1 解锁
// "scenes"     → Tab 1+2 解锁
// "storyboard" → Tab 1+2+3 解锁
```

### `tab-nav.tsx`
```tsx
// 三个 Tab：剧本 / 场景&分镜 / Storyboard
// 已完成：✓ + 文字，可点击
// 当前：高亮
// 未解锁：灰色，不可点击
```

### `layout.tsx`
```tsx
// 读取 project.workflow_state
// 渲染 <TabNav state={workflowState} projectId={id} />
// 渲染 {children}（当前 Tab 内容）
```

### 验收
- [ ] 三个路由对应三个 Tab
- [ ] Tab 按 workflow_state 正确解锁/禁用
- [ ] Tab 之间可以点击切换（已解锁的）

---

## Task 5：Tab 1 — 剧本编辑（S06）

**目标：** 显示生成的剧本，支持编辑、AI 对话调整、确认。

### 文件
- `src/app/(workspace)/app/projects/[projectId]/script/page.tsx`
- `src/components/workspace/script-editor.tsx` — 左侧编辑器（client）
- `src/components/workspace/ai-chat-panel.tsx` — 右侧 AI 对话面板（client）
- `src/app/api/projects/[projectId]/script/route.ts` — 获取/更新/重新生成剧本

### 布局
```
左 70%：script-editor（textarea，场景分割线系统插入灰色显示）
右 30%：ai-chat-panel（对话输入 + 发送 + 历史）
底部操作栏：[重新生成剧本] [确认剧本 →]
```

### API 路由
```
GET  /api/projects/[id]/script           → 返回 scripts 最新记录
PUT  /api/projects/[id]/script           → 保存编辑内容（自动保存）
POST /api/projects/[id]/script/generate  → 重新生成（消耗 credit）
POST /api/projects/[id]/script/confirm   → 更新 workflow_state="scenes"
                                           触发场景生成（POST /scenes/generate）
POST /api/projects/[id]/script/chat      → AI 局部调整（返回修改建议）
```

### 验收
- [ ] 剧本内容可编辑，有自动保存（500ms debounce）
- [ ] AI 对话面板可以发送消息，返回修改建议并应用到编辑器
- [ ] 「确认剧本」后 Tab 2 解锁，页面跳转到 Tab 2

---

## Task 6：Tab 2 — 场景 & 分镜 + 资产缺口（S07）

**目标：** 展示场景和分镜卡，支持编辑，显示资产缺口提示。

### 文件
- `src/app/(workspace)/app/projects/[projectId]/scenes/page.tsx`
- `src/components/workspace/scene-list.tsx` — 可折叠场景列表（client）
- `src/components/workspace/shot-card.tsx` — 分镜卡（inline 编辑）
- `src/components/workspace/asset-gap-banner.tsx` — 资产缺口提示区
- `src/app/api/projects/[projectId]/scenes/route.ts`
- `src/app/api/projects/[projectId]/shots/[shotId]/route.ts`
- `src/app/api/projects/[projectId]/scenes/confirm/route.ts`

### 场景生成（Task 5 确认剧本时触发）
```ts
// POST /api/projects/[id]/scenes/generate
// 调用 generateText(buildScenePrompt(scriptContent))
// 解析 JSON，批量插入 scenes + shots
// 同时调用 generateText(buildAssetGapPrompt(script)) 生成资产缺口
// 批量插入 assets（status="missing"）
// 消耗 scene_generation credit
```

### `shot-card.tsx` 内联编辑
```tsx
// 只读态：四个字段一行显示 + [编辑] 按钮
// 编辑态：四个字段各自 input/select + [取消][保存]
// 保存 → PATCH /api/projects/[id]/shots/[shotId]
```

### `asset-gap-banner.tsx`
```tsx
// 从 assets 表读取 status="missing" 的记录
// 🔴 priority="required"
// 🟡 priority="suggested"
// [生成] → 触发打开 S08 资产生成抽屉
// [跳过] → 标记 asset.status="skipped"（本地状态，不入库）
```

### 验收
- [ ] 场景列表展示，可折叠
- [ ] 分镜卡可 inline 编辑四字段
- [ ] 资产缺口正确分级显示（红/黄）
- [ ] 「确认场景」后 Tab 3 解锁

---

## Task 7：资产生成面板（S08）

**目标：** 右侧抽屉面板，通过对话生成/替换资产图。

### 文件
- `src/components/workspace/asset-panel.tsx` — 右侧抽屉（client）
- `src/app/api/projects/[projectId]/assets/[assetId]/route.ts`
- `src/app/api/projects/[projectId]/assets/[assetId]/generate/route.ts`

### `asset-panel.tsx`
```tsx
// Props: assetId, onClose
// 展示：资产名称、当前状态、对话历史
// 对话：用户描述 → 发送 → 调用生成 API
// 预览：生成后显示 image，[重新生成][使用这张][上传替换]
// 「使用这张」→ 更新 asset.image_url + status="generated" → 关闭面板
```

### 图片生成 API
```ts
// POST /api/projects/[id]/assets/[assetId]/generate
// body: { description }
// 调用 generateImage(description, aiConfig)
// 上传图片到 Supabase Storage: assets/{projectId}/{assetId}.png
// 更新 assets.image_url + status="generated"
// 消耗 asset_generation credit
// 返回: { imageUrl }
```

### 上传替换
```ts
// POST /api/projects/[id]/assets/[assetId]/upload
// multipart/form-data，上传到 Storage
// 更新 asset.image_url + status="uploaded"
```

### 验收
- [ ] 面板从右侧滑入，不覆盖主内容
- [ ] 对话生成图片，预览正常
- [ ] 上传替换正常
- [ ] 关闭后对应缺口行状态更新

---

## Task 8：Tab 3 — Storyboard（S09）

**目标：** 宫格选择，按场景生成合成图，支持提示词编辑。

### 文件
- `src/app/(workspace)/app/projects/[projectId]/storyboard/page.tsx`
- `src/components/workspace/storyboard-generator.tsx` — 生成控制（client）
- `src/components/workspace/storyboard-card.tsx` — 单场景卡片
- `src/app/api/projects/[projectId]/storyboards/route.ts`
- `src/app/api/projects/[projectId]/storyboards/[sceneId]/generate/route.ts`

### 生成流程
```ts
// POST /api/projects/[id]/storyboards/[sceneId]/generate
// body: { gridSize, aspectRatio, customPrompt? }
// 1. 读取该 scene 的 shots
// 2. 读取项目 assets（已生成的）
// 3. 如无 customPrompt: 调用 buildStoryboardPrompt(...)
// 4. 调用 generateImage(prompt, aiConfig)，size 根据 aspectRatio 选择
// 5. 上传到 Storage: storyboards/{projectId}/{sceneId}.png
// 6. 更新 storyboards.image_url + status="done" + prompt
// 7. 消耗 storyboard_generation credit
```

### `storyboard-generator.tsx`
```tsx
// 顶部：宫格选择（6/9/12/16/18）+ 比例选择
// [生成全部] 按钮 → 顺序触发所有场景生成
// 各场景卡片显示生成状态（pending/generating/done/failed）
```

### `storyboard-card.tsx`
```tsx
// 已生成：显示 <img> + [查看/编辑提示词][重新生成][下载]
// 编辑提示词：inline textarea，[取消][用此提示词重新生成]
// 未生成：空白占位 + [单独生成]
```

### 验收
- [ ] 宫格/比例选择生效
- [ ] 全部场景可批量生成（顺序，显示进度）
- [ ] 提示词可查看并编辑后重新生成
- [ ] 下载单张图片正常

---

## Task 9：项目工作台 Dashboard（S11）

**目标：** 进度看板 + 可操作的资产管理，所有模块的重入口。

### 文件
- `src/app/(workspace)/app/projects/[projectId]/page.tsx` — 改为 Dashboard
- `src/components/workspace/progress-board.tsx` — 左侧进度列
- `src/components/workspace/asset-manager.tsx` — 右侧资产管理（client）

### `progress-board.tsx`
```tsx
// 从 project.workflow_state + counts 推导每行状态
// 行：剧本 / 场景&分镜 / 资产 / Storyboard
// 每行：状态图标 + 描述 + 操作按钮（跳转对应 Tab 或面板）
// 底部：[导出素材包] → /app/projects/[id]/export
```

### `asset-manager.tsx`
```tsx
// 按 asset_type 分组展示
// 每张资产卡片：
//   已生成/已上传：<img 缩略图> + [替换][重新生成][与AI调整]
//   missing：[生成] 按钮
// [替换] → 弹出文件上传
// [重新生成] / [与AI调整] / [生成] → 打开 asset-panel.tsx 抽屉
```

### 验收
- [ ] 进度行准确反映 workflow_state
- [ ] 点击各行进入对应 Tab
- [ ] 资产卡片可触发生成/替换/重生成
- [ ] Credit 余额显示在顶部导航栏

---

## Task 10：导出（S10）+ 设置（S12）

### 导出

**文件**
- `src/app/(workspace)/app/projects/[projectId]/export/page.tsx`
- `src/app/api/projects/[projectId]/export/route.ts`

**导出 API**
```ts
// POST /api/projects/[id]/export
// 1. 读取：script + scenes + shots + assets + storyboards
// 2. 生成文件内容：
//    script.txt          剧本全文
//    scenes.json         场景+分镜结构化数据
//    prompts.txt         所有场景的 storyboard 提示词
// 3. 下载所有 image_url，打包进 ZIP
//    assets/characters/*.png
//    assets/scenes/*.png
//    assets/props/*.png
//    assets/style/*.png
//    storyboards/*.png
// 4. 返回 ZIP 文件流（Content-Type: application/zip）
```

**页面**
```tsx
// 勾选列表（默认全选）
// 警告：缺失资产提示
// [下载 ZIP] → POST /api/.../export → blob 下载
```

### 设置

**文件**
- `src/app/(workspace)/app/settings/page.tsx`
- `src/app/api/settings/ai-mode/route.ts`

**设置页面**
```tsx
// Credit 余额展示 + 消耗参考表
// BYOK 表单：base URL + API key（显示/隐藏）
// 保存 → 写入 profiles.byok_base_url + profiles.byok_api_key_encrypted
// 模式切换：Viby / BYOK radio
```

### 验收
- [ ] 导出生成正确的 ZIP 文件结构
- [ ] 缺失资产有警告，可忽略继续导出
- [ ] BYOK 保存后 AI 调用切换到用户 key
- [ ] 模式切换实时生效

---

## 执行顺序

```
Task 1  数据库 schema
   ↓
Task 2  AI 路由层
   ↓
Task 3  项目创建 + Onboarding（S04/S05）
   ↓
Task 4  三步 Tab 骨架
   ↓
Task 5  Tab 1：剧本
   ↓
Task 6  Tab 2：场景&分镜
   ↓
Task 7  资产生成面板
   ↓
Task 8  Tab 3：Storyboard
   ↓
Task 9  Dashboard（S11）
   ↓
Task 10 导出 + 设置
```

每个 Task 完成后可独立验收，不需要等全部完成才能预览。

---

## 环境变量

```
VIBY_AI_BASE_URL=          # Viby 托管 AI 的 base URL
VIBY_AI_API_KEY=           # Viby 托管 AI 的 key
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY= # 服务端操作 storage 用
```

---

*计划版本：V1.0 · 2026-06-25*  
*依据：viby-spec-v2.2.md · viby-design-spec-for-prototype.md*
