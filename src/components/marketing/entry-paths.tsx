const entries = [
  { n: "01", t: "一句话脑暴", d: "有个模糊的想法就够了。Viby 帮你把一句描述展开成有结构的故事、场景和分镜草案。", tag: "想法阶段" },
  { n: "02", t: "导入剧本", d: "直接导入结构化剧本，Viby 解析场景和人物，按剧本节奏生成完整分镜和参考包。", tag: "有剧本" },
];

export function EntryPaths() {
  return (
    <section className="sec">
      <h2 className="sec-head" data-reveal>从你有的东西开始</h2>
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
