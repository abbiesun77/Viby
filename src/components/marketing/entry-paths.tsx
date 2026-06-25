const entries = [
  { n: "01", t: "一句话脑暴", d: "有个模糊的想法就够了。Viby 帮你把一句描述展开成有结构的故事、场景和分镜草案。", tag: "想法阶段" },
  { n: "02", t: "段落转分镜", d: "把你已经写好的段落或故事梗概贴进来，Viby 自动拆成场景和镜头，补全缺失的画面描述。", tag: "有草稿" },
  { n: "03", t: "导入剧本", d: "直接导入结构化剧本，Viby 解析场景和人物，按剧本节奏生成完整分镜和参考包。", tag: "有剧本" },
];

export function EntryPaths() {
  return (
    <section className="sec">
      <p className="sec-kicker" data-reveal>创作入口</p>
      <h2 className="sec-head" data-reveal data-d="1">从你有的东西开始</h2>
      <div>
        {entries.map((e) => (
          <div key={e.n} className="entry-item" data-reveal>
            <div className="entry-n">{e.n}</div>
            <div>
              <div className="entry-t">{e.t}</div>
              <div className="entry-d">{e.d}</div>
            </div>
            <span className="entry-tag">{e.tag}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
