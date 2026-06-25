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
  mood: string
) {
  return `你是一位专业编剧助手。根据以下输入，写一份简洁的中文视频剧本（${duration}），风格${style}，情绪基调${mood}。

用户想法：${idea}

要求：
- 分场景，每个场景用 == 场景 N：标题 == 格式标注
- 每场景写 2-4 句画面描述，不需要台词
- 剧本总长度适合${duration}的视频
- 语言简洁，重点描述画面`;
}

export function buildScenePrompt(script: string) {
  return `根据以下剧本，提取场景列表和每个场景的分镜描述。

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
  return `分析以下剧本，列出需要参考图的角色、场景和道具，以减少视频生成时的不一致。

剧本：
${script}

只返回 JSON，不要任何解释文字，结构如下：
{
  "assets": [
    {
      "asset_type": "character|scene|prop|style",
      "name": "名称",
      "description": "用于生成参考图的简要描述",
      "priority": "required|suggested"
    }
  ]
}`;
}

export function buildStoryboardPrompt(
  sceneTitle: string,
  shots: { framing?: string | null; subject?: string | null; action?: string | null; mood?: string | null }[],
  gridSize: number,
  aspectRatio: string
) {
  const shotDescriptions = shots
    .map(
      (s, i) =>
        `镜头${i + 1}：${[s.framing, s.subject, s.action, s.mood].filter(Boolean).join("，")}`
    )
    .join("\n");

  return `为电影分镜图生成 ${gridSize} 格 storyboard 合成图，画面比例 ${aspectRatio}。

场景：${sceneTitle}
分镜描述：
${shotDescriptions}

要求：
- 黑白铅笔线稿分镜风格
- ${gridSize} 个格子均匀排列在一张图内
- 每格对应一个镜头，按顺序从左到右、从上到下排列
- 格子之间有明显分隔线
- 每格右下角标注镜号`;
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
