# Handover — Viby 项目交接

> 交接时间：2026-06-28
> 当前分支：`dev`（未提交，所有改动均在工作区）
> 远程仓库：https://github.com/abbiesun77/Viby.git
> 生产服务器：`npx next start` 运行中，端口 3000

---

## 一、项目概况

**Viby** — AI 视频前置创作工具。用户输入想法，AI 生成剧本→场景分镜→资产参考图→Storyboard。

**技术栈**：Next.js 14.2.30 + React 18 + TypeScript · Tailwind + workspace.css（OKLCH 浅色编辑风）· Supabase（远端，已拒绝本地化）· GSAP 3.15 · Vitest + Playwright

**关键约束**：
- ✅ 远端 Supabase only，不跑 Docker
- ✅ accent 色 `oklch(52% 0.10 28)`（暖橙红），**禁用紫色**
- ✅ GSAP 做动画
- ✅ 0 TypeScript 错误，build 通过

---

## 二、本次会话改动清单（2026-06-28）

### 1. 动画系统重做

**问题**：骨架屏布局与真实页面完全不匹配；shimmer 和入场动画抢 `opacity` 导致闪烁；PageTransition 用写死50ms timer 强插不匹配的客户端骨架。

**改动**：
- `src/components/ui/page-skeleton.tsx` — 完全重写为8个精确布局变体（list/dashboard/editor/board/assets/export/settings/new），新增 `topnav` 布尔参数。CSS `@keyframes` 做 shimmer（只动 background-position），GSAP 做入场（只动 y + autoAlpha），不再抢属性。
- `src/components/workspace/page-transition.tsx` — 砍掉客户端骨架逻辑，只保留顶部2px进度条 + 内容淡入。
- 14个 `loading.tsx` — 全部映射到正确变体。

### 2. TypeScript 预存错误全部修清

- **根因**：`createMockServerClient()` 返回类型与真实 `SupabaseClient` 不一致，`createClient()` 的联合类型导致所有查询结果退化为 `unknown`（44个错误）。
- **修法**：mock.ts 末尾加 `return client as unknown as SupabaseClient`（纯类型，运行时不变）。
- `chat-guide.tsx:87` 的 `goBack()` 断言位置错误也一并修掉。
- 结果：`tsc --noEmit` **0 错误**，`next build` 完整通过。

### 3. Onboarding 加内容类型 + 画面质感

- `src/components/onboarding/chat-guide.tsx` — Step 1 换成：内容类型（达人短视频/品牌 Commercial/微短剧/MV）+ 画面质感（真人感/电影感/广告精修感/Vlog感），共4步，不增加步骤数。
- `src/lib/validators/project.ts` — 加 `contentType`、`visualFeel` 可选字段。
- `src/app/api/projects/route.ts` — 透传到 DB 和 AI prompt。
- DB Migration 0007：`projects` 表加 `content_type TEXT`、`visual_feel TEXT`（已在远端执行）。

### 4. Prompt 体系升级

**文件：`src/lib/ai/prompts.ts`**

所有 SLOT 注释标记了可替换的预埋点（见文件顶部）：

| 函数 | 改动 |
|---|---|
| `buildTitlePrompt` | 新增，AI 自动生成项目标题 |
| `buildScriptPrompt` | 加内容类型结构指导、开篇法则、视觉技术前缀 |
| `buildAssetGapPrompt` | 加 C/S/P 编号规范；场景只描述空旷空间；道具只描述物体本身；风格锚点限一张 ST01 |
| `buildAssetImagePrompt` | 加 `assetType` 参数：scene 用空间摄影前缀，prop 用产品摄影前缀，character 用 visual_feel 前缀 |
| `buildStoryboardPrompt` | 加 `sceneDurationSecs` 参数，时间轴按实际时长标注 |
| `buildScenePrompt` | 加 `duration` 参数，每场景 shots 数量按时长控制（场景数跟剧本走，不强制限制） |

**SLOT 预埋点说明**（需要持续补充的提示词）：
- `VISUAL_FEEL_PREFIX` — 各质感的技术参数词组（真人感已根据用户收集的库优化）
- `CONTENT_TYPE_STRUCTURE` — 各内容类型的叙事结构公式
- `OPENING_GUIDANCE` — 6种开场模板
- `CAMERA_KEYWORDS` — 运镜关键词（需针对实际调用的视频AI工具实测调优）

### 5. 图像生成：img2img 支持

- `src/lib/ai/client.ts` — 新增 `generateImageWithRef(prompt, config, referenceUrl?)`，当 `referenceUrl` 存在时，走 `/images/generations` 并传 `image: [referenceUrl]` 参数（right.codes `/v1/images/generations` 的 `image[]` 字段支持 URL 参考图）。
- `src/app/api/projects/[projectId]/assets/[assetId]/generate/route.ts` — 全部重写：加载 `visual_feel`，自动查找同类型已有图作为参考（C01→C02 一致性），场景类型优先找 ST 风格锚点。

### 6. BYOK 分离文本/图像配置

**问题**：原来只有一个 Base URL + Key，文本和图像生成共用同一配置。

**改动**：
- DB Migration 0008：`profiles` 表加 `byok_image_base_url`、`byok_image_api_key`、`byok_text_model`、`byok_image_model`（已在远端执行）。
- `src/lib/ai/client.ts` — `AiConfig` 接口扩展，`resolveImageEndpoint` 优先用图像专属配置，回退到文本配置。
- `src/lib/ai/config.ts` — `resolveAiConfig` 读新字段。
- `src/app/api/settings/ai-mode/route.ts` — 接受并保存新字段。
- `src/components/workspace/settings-form.tsx` — 完全重写：文本AI / 图像AI 两段，每段含 provider 预设快选（OpenAI/Anthropic/DeepSeek/Right Code）+ Base URL + Key + 模型名。
- `src/app/(workspace)/app/settings/page.tsx` — 传新 props。

### 7. 项目管理：改名 + 删除

- `src/app/api/projects/[projectId]/route.ts` — 新增 PATCH（改名）+ DELETE 路由。
- `src/components/workspace/project-card.tsx` — 新建客户端组件：鼠标悬停显示操作按钮，点×进入内联确认态，确认后卡片淡出动画（250ms）再调 API，`router.refresh()` 刷新列表。
- **注意**：原 projects 表缺 DELETE RLS 策略，已手动在远端加上（这是删除不生效的根本原因）。

### 8. 自动生成项目标题

`buildTitlePrompt` + `projects/route.ts` 修改：确认剧本时并行调用标题生成和剧本生成（`Promise.all`），AI 标题写回 `projects.title`。

### 9. 样式：全面去圆角

`workspace.css` reset 块加 `border-radius: 0 !important`，一行覆盖所有元素。

### 10. Storyboard 时间轴修复

storyboard 生成路由重写：
- 读项目 `duration` + 场景总数，自动计算每场景时长
- `gridSize` = shot 数量（不再写死16），上限9
- `parseDurationSeconds` 辅助函数解析「5秒」「1分30秒」等格式

---

## 三、Supabase 迁移状态

| Migration | 内容 | 状态 |
|---|---|---|
| 0001~0002 | 基础表 | ✅ 远端已执行 |
| 0003~0006 | Storage/Profile/Backfill | ✅ 远端已执行 |
| 0007 | projects.content_type / visual_feel | ✅ 远端已执行（本次） |
| 0008 | profiles BYOK 文本/图像分离 | ✅ 远端已执行（本次） |
| projects DELETE RLS | 补 DELETE 策略 | ✅ 远端已执行（本次） |

`supabase/apply_to_remote.sql` 已追加 0007 + 0008 内容，后续可整体重放。

---

## 四、已知问题 & 待办

### 待用户操作
- 暂无阻塞项，所有 DB 迁移均已执行。

### 技术债
1. **角色一致性**：img2img 参考图已接通（`image[]` 参数），但 right.codes 在实际调用时的表现需要用户实测确认效果。若模型不认 `image` 参数，需改用文字描述锚点。
2. **`docs/真人感人像提示词库.xlsx`** 里收集的提示词已提炼进 `VISUAL_FEEL_PREFIX["真人感"]`，但其他质感（电影感/广告精修感/Vlog感）还是基础版，有待补充真实测试数据。
3. **CAMERA_KEYWORDS** 里的运镜词组需要针对用户实际使用的视频 AI 工具（可灵/即梦/Kling）实测后替换，不同工具关键词效果差异很大。
4. **`src/components/ui/gsap-loader.tsx`** 的 `GsapLoader` 是死代码（按钮 spinner 都内联了），保留备用未删。
5. **`loading.tsx` 在 dev 模式不稳定**——Next.js 14 Suspense 边界 timing 问题，生产 build 正常。

### 可能的后续工作方向
- [ ] commit + push dev 分支
- [ ] 「角色三视图」生成流程（用户明确要求：先生成三视图作为基准，再生成各状态，目前只做了参考图 img2img 接入，UI 引导还不完整）
- [ ] 场景一致性 ST01 风格锚点在实际图像生成中的效果验证
- [ ] 提示词管理模块（`prompt_templates` DB 表，让 prompt 可在不改代码的情况下调优和 A/B 测试）
- [ ] 删除动画后 `router.refresh()` 在有大量项目时较慢，考虑乐观更新

---

## 五、关键文件索引

| 用途 | 路径 |
|---|---|
| Prompt 预埋点（所有 SLOT） | `src/lib/ai/prompts.ts` |
| AI 客户端（img2img 在这里） | `src/lib/ai/client.ts` |
| AI 配置读取（BYOK 分离） | `src/lib/ai/config.ts` |
| 资产图片生成路由 | `src/app/api/projects/[projectId]/assets/[assetId]/generate/route.ts` |
| Storyboard 生成路由 | `src/app/api/projects/[projectId]/storyboards/[sceneId]/generate/route.ts` |
| 场景生成服务 | `src/lib/db/scene-service.ts` |
| 项目列表卡片（改名/删除） | `src/components/workspace/project-card.tsx` |
| 骨架屏 | `src/components/ui/page-skeleton.tsx` |
| 路由过渡动画 | `src/components/workspace/page-transition.tsx` |
| 设置页表单 | `src/components/workspace/settings-form.tsx` |
| Onboarding 引导 | `src/components/onboarding/chat-guide.tsx` |
| 工作区样式 | `src/app/(workspace)/workspace.css` |
| 环境变量定义 | `src/lib/env.ts` |

---

## 六、启动指南

```bash
cd "/Users/kongutei/Documents/Coding Projects/Viby"
pkill -f "next dev"; pkill -f "next start"; pkill -f "next-server"
npm run dev         # dev 模式（骨架屏 loading 可能不触发，正常）
# 或
npx next build && npx next start   # 生产模式（骨架稳定，推荐验证）
```

dev server 默认 `http://localhost:3000`。

---

## 七、用户偏好备忘

- 直接、不啰嗦；反馈直接（"你想气死我？"），需求清晰。
- **远端 Supabase only**，说过多次，不接受本地化。
- 动画审美：无圆角直角风格；accent 暖橙红；没有紫色。
- 使用场景：内部团队给达人合作做参考物 + 自媒体起号低成本复刻达人风格。商业内容（commercial）为主要需求，不只是短剧。
- 对提示词有主观判断力，会提供真实收集的样本（见 `docs/`）。
- 图像后端用 right.codes（`https://www.right.codes/draw`），支持 `/v1/images/generations` + `image[]` 参数做 img2img。

---

*交接完毕。如有疑问可查阅本次会话历史或 `src/lib/ai/prompts.ts` 顶部的 SLOT 注释。*
