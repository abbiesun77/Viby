/**
 * Mock data for demo mode. Used by /app/demo to showcase the full Viby
 * workflow without a backend. Not wired to any real database.
 */

export const demoProject = {
  id: "demo-project",
  title: "便利店里的未来自己",
  entry_mode: "idea" as const,
  workflow_state: "storyboard",
  style: "电影感",
  duration: "30秒",
  mood: "孤寂、带点温情",
};

export const demoScript = `== 场景 1：深夜便利店 ==
凌晨两点，宇航员阿岚推开便利店的玻璃门，冷气扑面而来。
货架上只剩一盒临期便当。他盯着价签，手指无意识地摩挲着头盔上的划痕。

== 场景 2：收银台 ==
收银台后站着一个穿同样航天服的男人。
阿岚抬头，四目相对。对方比他老一些，眼下有更深的疲惫。
"你也是来买便当的？"对方问，声音哑得像砂纸。

== 场景 3：店外 ==
两人并肩坐在便利店台阶上，便当盒搁在中间。
远处的城市灯光像一片不真实的星海。
"她会等你回去的。"对方说，"她一直都在等。"
阿岚没说话，只是点了点头。`;

export const demoScenes = [
  { id: "s1", scene_number: 1, title: "深夜便利店" },
  { id: "s2", scene_number: 2, title: "收银台" },
  { id: "s3", scene_number: 3, title: "店外" },
];

export const demoShots = [
  // Scene 1
  { id: "sh1", scene_id: "s1", shot_number: 1, framing: "全景", subject: "便利店外景 + 阿岚推门", action: "推门进入，冷气溢出", mood: "孤寂" },
  { id: "sh2", scene_id: "s1", shot_number: 2, framing: "中景", subject: "货架前的阿岚", action: "拿起临期便当，摩挲头盔划痕", mood: "疲惫" },
  { id: "sh3", scene_id: "s1", shot_number: 3, framing: "特写", subject: "便当价签 + 阿岚的手指", action: "手指划过价签日期", mood: "时间流逝感" },
  // Scene 2
  { id: "sh4", scene_id: "s2", shot_number: 1, framing: "双人中景", subject: "阿岚与未来的自己", action: "四目相对", mood: "震惊" },
  { id: "sh5", scene_id: "s2", shot_number: 2, framing: "近景", subject: "未来的阿岚", action: "开口说话", mood: "疲惫、苍老" },
  // Scene 3
  { id: "sh6", scene_id: "s3", shot_number: 1, framing: "全景", subject: "两人并肩坐在台阶", action: "吃便当，远眺城市", mood: "温情" },
  { id: "sh7", scene_id: "s3", shot_number: 2, framing: "特写", subject: "阿岚侧脸", action: "点头", mood: "释然" },
];

export const demoAssets = [
  { id: "a1", asset_type: "character" as const, name: "阿岚（现在）", description: "男性，30 岁左右，疲惫的脸，旧款白色航天服，头盔夹在腋下", image_url: null, status: "missing", priority: "required" as const },
  { id: "a2", asset_type: "character" as const, name: "阿岚（未来）", description: "同一个人，但更老，眼下深纹，航天服更旧", image_url: null, status: "missing", priority: "required" as const },
  { id: "a3", asset_type: "scene" as const, name: "深夜便利店内部", description: "冷白荧光灯，稀疏货架，玻璃门外的夜色", image_url: null, status: "generated", priority: "required" as const },
  { id: "a4", asset_type: "scene" as const, name: "便利店门外台阶", description: "水泥台阶，远处城市星海般的灯光", image_url: null, status: "missing", priority: "suggested" as const },
  { id: "a5", asset_type: "prop" as const, name: "临期便当盒", description: "透明塑料盒，标签显示临期日期", image_url: null, status: "missing", priority: "suggested" as const },
  { id: "a6", asset_type: "style" as const, name: "整体视觉风格", description: "冷调荧光与暖调城市灯光的对比，胶片颗粒感", image_url: null, status: "missing", priority: "required" as const },
];

export const demoStoryboards = [
  { id: "sb1", scene_id: "s1", scene_number: 1, title: "深夜便利店", image_url: null, prompt: "全景，深夜便利店外景，玻璃门推开冷气溢出，宇航员背影，荧光灯冷白光，胶片颗粒感", grid_size: 16 },
  { id: "sb2", scene_id: "s2", scene_number: 2, title: "收银台", image_url: null, prompt: "双人中景，两个穿航天服的男人对视，一个年轻一个苍老，收银台背景，荧光灯", grid_size: 16 },
  { id: "sb3", scene_id: "s3", scene_number: 3, title: "店外", image_url: null, prompt: "全景，两人并肩坐台阶，便当盒在中间，远处城市星海灯光，冷调转暖", grid_size: 16 },
];
