const steps = [
  { n: "01", t: "输入想法或剧本", d: "一句话、一段文字或完整剧本，三种入口随你选，不需要先懂分镜术语。" },
  { n: "02", t: "生成故事大纲与分场", d: "先整理叙事骨架，确认场景结构，避免一上来就在镜头细节里迷失。" },
  { n: "03", t: "展开分镜卡与参考图", d: "每张分镜卡包含主体、动作、镜头语言和情绪。Viby 同时检测哪些参考素材还缺。" },
  { n: "04", t: "导出素材包", d: "镜头清单、角色设定图、场景定调图和前后连贯说明，打包交给视频模型。" },
];

export function WorkflowStrip() {
  return (
    <section className="sec" id="workflow">
      <h2 className="sec-head" data-reveal>从想法到可投喂的素材包</h2>
      <div className="wf-grid">
        {steps.map((s, i) => (
          <div key={s.n} className="wf-step" data-reveal data-d={i > 0 ? String(i) : undefined}>
            <div className="wf-n">{s.n}</div>
            <div className="wf-t">{s.t}</div>
            <div className="wf-d">{s.d}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
