"use client";

import { useState } from "react";

const STYLE_OPTIONS = ["写实纪录感", "电影感", "广告感", "动画/插画感"];
const DURATION_OPTIONS = ["15秒", "30秒", "60秒"];

/**
 * Demo-mode script editor. Mirrors the real ScriptEditor UI:
 * left = editable-looking script doc, right = AI chat panel with
 * input box (disabled), bottom = action bar with back / confirm.
 */
export function DemoScriptEditor({ content }: { content: string }) {
  const [input, setInput] = useState("");
  const [feed] = useState<{ role: "viby" | "user"; text: string }[]>([
    { role: "viby", text: "剧本已生成。需要调整节奏、增删场景，或改某段氛围，告诉我就行。" },
    { role: "user", text: "能不能把第二个场景的对话再精简一点？" },
    { role: "viby", text: "好的，我已经精简了收银台场景的对话，去掉了多余的铺垫，保留了核心的「你也是来买便当的？」这句。" },
  ]);

  function parseBlocks(text: string) {
    const lines = text.split("\n");
    const blocks: { head: string | null; body: string }[] = [];
    let current: { head: string | null; body: string } | null = null;
    const headRe = /^==\s*(.+?)\s*==$/;
    for (const line of lines) {
      const m = line.match(headRe);
      if (m) {
        if (current) blocks.push(current);
        current = { head: m[1], body: "" };
      } else {
        if (!current) current = { head: null, body: "" };
        current.body += (current.body ? "\n" : "") + line;
      }
    }
    if (current) blocks.push(current);
    return blocks;
  }

  const blocks = parseBlocks(content);

  return (
    <section className="panel-script">
      <div className="script-layout">
        <div className="script-main">
          <div className="script-doc">
            {blocks.map((b, i) => (
              <div key={i}>
                {b.head && <div className="scene-head">{b.head}</div>}
                <p className="script-para">{b.body}</p>
              </div>
            ))}
          </div>
        </div>

        <aside className="script-aside">
          <div className="aside-title">和 AI 一起调整剧本</div>
          <div className="aside-sub">描述你想改动的地方，Viby 会帮你重写对应段落。</div>
          <div className="ai-feed">
            {feed.map((m, i) => (
              <div key={i} className={`ai-bubble ${m.role}`}>
                {m.text}
              </div>
            ))}
            <div className="ai-bubble viby" style={{ opacity: 0.6 }}>
              <span className="dots"><span /><span /><span /></span>
            </div>
          </div>
          <div className="ai-input-row">
            <input
              className="ai-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="演示模式下不可发送"
              disabled
            />
            <button className="ai-send" disabled>发送</button>
          </div>
        </aside>
      </div>

      <div className="action-bar">
        <div className="ab-left">
          <a className="btn-g" href="/app/demo">← 返回项目</a>
          <span style={{ fontSize: 12, color: "var(--muted)", alignSelf: "center", marginLeft: 8 }}>
            已保存
          </span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <a className="btn-p" href="/app/demo/scenes">确认剧本，进入场景 →</a>
        </div>
      </div>
    </section>
  );
}
