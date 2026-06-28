// ─────────────────────────────────────────────────────────────────────────────
// Prompt embedding points  (pre-baked knowledge, no user copy-paste needed)
// Each section is a named "slot" that can be replaced with curated content.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * SLOT: visual-feel-prefix
 * Translates abstract quality intent into concrete technical prompt fragments.
 * Injected into every AI call that produces visual output (script desc, asset
 * gen, storyboard). Curate these to match the actual AI tools you're calling.
 */
const VISUAL_FEEL_PREFIX: Record<string, string> = {
  // Distilled from curated prompt library (docs/真人感人像提示词库.xlsx)
  // Core insight: imperfection = authenticity. Direct flash + visible grain + real skin texture
  // are stronger authenticity signals than "natural light".
  "真人感":
    "shot on compact digital camera or smartphone, harsh direct camera flash, " +
    "heavy film grain, CCD sensor aesthetic, visible pores and natural skin texture, " +
    "candid unposed moment, slight motion blur, authentic expressions, real location, " +
    "natural color grade, slightly elevated exposure, " +
    "no airbrushed retouching, no studio backdrop, no CGI, no 3D render, " +
    "no beauty filter, no plastic skin, no artificial bokeh, no perfect symmetric lighting",
  "电影感":
    "anamorphic lens, cinematic widescreen, motivated lighting, deliberate composition, " +
    "film grain, teal-orange color grade, dramatic depth of field",
  "广告精修感":
    "commercial photography style, aspirational and polished, hero product shot, " +
    "perfect controlled lighting, clean background, premium color grade",
  "动画/风格化":
    "stylized illustration, consistent art direction, bold color palette, " +
    "graphic design aesthetic, no photorealism",
  "Vlog感":
    "casual handheld, natural light, authentic everyday moments, warm color grade, " +
    "slice-of-life feel, real environment",
};

/**
 * SLOT: content-type-structure
 * Script narrative structure guidelines per content type.
 * Replace/extend these with battle-tested structures from your genre research.
 */
const CONTENT_TYPE_STRUCTURE: Record<string, string> = {
  "达人短视频":
    "结构：强钩子（前3秒必须抓住注意力）→ 核心内容/价值（展示/讲述）→ 行动号召或情感共鸣收尾。" +
    "禁止开场白铺垫，第一帧就要制造好奇或反差。",
  "品牌 Commercial":
    "结构：痛点场景建立（用户代入）→ 产品/解决方案出现 → 品牌记忆点（视觉锤+语言钉）。" +
    "镜头语言要服务于品牌调性，每个场景都在传递品牌价值。",
  "微短剧/剧情":
    "结构：极端开场（身份反差/困境/悬念）→ 冲突升级（每场景压力递增）→ 爽点/悬念收尾。" +
    "前5秒决定留存，结尾必须有拉动下一集的钩子。",
  "MV / 创意短片":
    "结构：情绪主题建立 → 视觉意象递进 → 情感高潮 → 余韵收尾。" +
    "以情绪弧线为主线，画面叙事优先于文字叙事。",
};

/**
 * SLOT: opening-templates
 * Six proven opening patterns. AI uses the best match for content type + mood.
 * Source: battle-tested short-video opening research.
 */
const OPENING_GUIDANCE = `
开场模板（选最适合内容类型的一种）：
1. 直接打脸型 — 主角被当众轻视，紧跟身份/实力揭示
2. 身份反转型 — 表面弱势角色瞬间亮出真实身份
3. 极端困境型 — 主角处于绝境，紧接转机出现
4. 倒叙悬念型 — 先展示高冲击结果，再回溯"为什么"
5. 高甜钩子型 — 意外亲密接触，制造心跳瞬间
6. 直接价值型 — 前3秒直接给出最有价值的信息或最惊人的画面（适合商业/达人）
`.trim();

/**
 * SLOT: camera-movement-keywords
 * Reference vocabulary for shot descriptions. Curate per video AI tool.
 * Current set covers Kling / Seedance / Runway common keywords.
 */
const CAMERA_KEYWORDS: Record<string, string> = {
  "真人感":   "手持晃动, 跟随镜头, 过肩, 自然呼吸感, 随机构图",
  "电影感":   "缓慢推镜, 希区柯克变焦, 环绕镜头, 固定宽景, 升镜头",
  "广告精修感": "稳定推近, 产品特写旋转, 慢动作, 对称构图",
  "Vlog感":   "手持随走, 快速切换, 俯拍物品, 第一视角",
};

// ─────────────────────────────────────────────────────────────────────────────
// Public prompt builders
// ─────────────────────────────────────────────────────────────────────────────

export function buildTitlePrompt(idea: string, contentType?: string, mood?: string) {
  return `根据以下视频创作想法，生成一个简洁有力的中文标题（2-8个字，不含标点符号）。
内容类型：${contentType ?? "短视频"}，情绪基调：${mood ?? ""}
创作想法：${idea}
只返回标题本身，不要任何解释或标点。`;
}

export function buildDirectorSystemPrompt() {
  return [
    "你是 Viby 的导演型助手。",
    "你的目标不是只会生图，而是帮助用户为视频生成准备更稳定的镜头与素材。",
    "当素材不够时，你要明确指出缺口，例如人物三视图、场景大全景、道具设定图、风格锚点。",
  ].join("\n");
}

export function buildScriptPrompt(
  idea: string,
  style: string,
  duration: string,
  mood: string,
  contentType?: string,
  visualFeel?: string
) {
  const feelPrefix = visualFeel ? VISUAL_FEEL_PREFIX[visualFeel] : null;
  const structure = contentType ? CONTENT_TYPE_STRUCTURE[contentType] : null;

  return `你是一位专业编剧助手。根据以下输入，写一份简洁的中文视频剧本（${duration}）。

用户想法：${idea}
内容类型：${contentType ?? "通用短视频"}
视觉调性：${visualFeel ?? style}，情绪基调：${mood}
${feelPrefix ? `\n画面技术风格（用于场景描述参考）：${feelPrefix}` : ""}

${structure ? `叙事结构要求：\n${structure}\n` : ""}
${OPENING_GUIDANCE}

输出格式：
- 分场景，每个场景用 == 场景 N：标题 == 格式标注
- 每场景写 2-4 句画面描述，融入上述视觉风格，不需要台词
- 剧本总长度适合 ${duration} 的视频
- 语言简洁，重点描述画面和情绪`.trim();
}

export function buildScenePrompt(script: string, duration?: string | null) {
  // Scale shots-per-scene with duration; scene count follows the script.
  const secs = duration
    ? (() => {
        const m = duration.match(/(\d+)\s*分/), s = duration.match(/(\d+)\s*秒/);
        return (m ? parseInt(m[1]) * 60 : 0) + (s ? parseInt(s[1]) : 0);
      })()
    : 30;
  const maxShotsPerScene = secs <= 15 ? 2 : secs <= 30 ? 3 : 4;

  return `根据以下剧本，提取场景列表和每个场景的分镜描述。
视频总时长约 ${duration ?? "30秒"}，每个场景最多 ${maxShotsPerScene} 个镜头（场景数量保持与剧本一致，不要合并或删减场景）。

剧本：
${script}

只返回 JSON，不要任何解释文字，结构如下：
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
  return `分析以下剧本，列出需要参考图的角色、场景、道具，以及整体视觉风格。
使用编号规范：角色用 C01-C99，场景用 S01-S99，道具用 P01-P99，风格参考用 ST01（最多1张）。

规则：
- 场景（scene）描述只写空旷空间特征（光线、陈设、材质、色温），不含任何人物动作。
- 角色（character）描述只写外貌特征（发型、服装、五官），不写动作。
- 道具（prop）只写物体本身的外形、材质、颜色，不写人物使用场景。
- 风格参考（style）：整个项目只生成一张 ST01，描述全片的整体视觉调性——色彩基调（暖/冷/中性）、饱和度、色调偏向、光线质感、胶片/数码感。用可以直接作为图像生成提示词的语言，不要写摄影技法。

剧本：
${script}

只返回 JSON：
{
  "assets": [
    {
      "asset_type": "character|scene|prop|style",
      "name": "编号 + 名称",
      "description": "生成参考图用的简要描述",
      "priority": "required|suggested"
    }
  ]
}`;
}

export function buildAssetImagePrompt(
  description: string,
  visualFeel?: string | null,
  assetType?: string | null
) {
  // Scene and prop assets: no people, just the object/space itself.
  if (assetType === "scene") {
    return (
      "empty location photography, no people, architectural interior/exterior reference shot, " +
      "real environment, natural lighting, wide establishing shot, " +
      description
    );
  }
  if (assetType === "prop") {
    return (
      "product photography, isolated object on neutral background, no people, " +
      "sharp focus, clean composition, " +
      description
    );
  }
  const feelPrefix = visualFeel ? VISUAL_FEEL_PREFIX[visualFeel] : null;
  return feelPrefix ? `${feelPrefix}, ${description}` : description;
}

export function buildStoryboardPrompt(
  sceneTitle: string,
  shots: { framing?: string | null; subject?: string | null; action?: string | null; mood?: string | null }[],
  gridSize: number,
  aspectRatio: string,
  visualFeel?: string | null,
  sceneDurationSecs?: number
) {
  const totalSecs = sceneDurationSecs ?? 15;
  const secPerShot = shots.length > 0 ? totalSecs / shots.length : totalSecs;
  const cameraStyle = visualFeel ? CAMERA_KEYWORDS[visualFeel] : null;
  const feelPrefix = visualFeel ? VISUAL_FEEL_PREFIX[visualFeel] : null;

  const shotDescriptions = shots
    .map(
      (s, i) =>
        `镜头${i + 1}（${(i * secPerShot).toFixed(1)}-${((i + 1) * secPerShot).toFixed(1)}秒）：` +
        `${[s.framing, s.subject, s.action, s.mood].filter(Boolean).join("，")}`
    )
    .join("\n");

  return `为电影分镜图生成 ${gridSize} 格 storyboard 合成图，画面比例 ${aspectRatio}。

场景：${sceneTitle}
${feelPrefix ? `视觉风格：${feelPrefix}` : ""}
${cameraStyle ? `运镜参考：${cameraStyle}` : ""}

分镜（时间轴格式）：
${shotDescriptions}

要求：
- 黑白铅笔线稿分镜风格
- ${gridSize} 个格子均匀排列在一张图内
- 每格对应一个镜头，按顺序从左到右、从上到下排列
- 格子之间有明显分隔线
- 每格右下角标注镜号和时间`.trim();
}

/**
 * Parse a JSON object out of an LLM response that may be wrapped in prose or
 * ```json fences. Returns the parsed value or throws.
 */
export function parseJsonFromText<T>(text: string): T {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) {
    throw new Error("无法从 AI 返回内容中解析 JSON。");
  }
  return JSON.parse(candidate.slice(start, end + 1)) as T;
}
