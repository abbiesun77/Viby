const assets = [
  { lbl: "角色", t: "角色设定图", d: "三视图、表情变体和服装参考，绑定到每一张用到该角色的分镜卡。" },
  { lbl: "场景", t: "场景定调图", d: "每个主要场景的全景参考，确保镜头与镜头之间空间连贯。" },
  { lbl: "道具", t: "道具参考图", d: "孤立背景的道具图，减少视频模型对重要物品的幻觉输出。" },
  { lbl: "风格", t: "风格锚点", d: "调色板、画面质感和摄影风格参考，统一整部短片的视觉语言。" },
];

export function AssetWorkspace() {
  return (
    <section className="sec">
      <p className="sec-kicker" data-reveal>资产工作台</p>
      <h2 className="sec-head" data-reveal data-d="1">不再把参考图散落在聊天记录里</h2>
      <div className="asset-grid">
        {assets.map((a, i) => (
          <div key={a.lbl} className="asset-item" data-reveal data-d={i > 0 ? String(i) : undefined}>
            <div className="asset-lbl">{a.lbl}</div>
            <div className="asset-t">{a.t}</div>
            <div className="asset-d">{a.d}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
