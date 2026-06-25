"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

interface Block {
  head: string | null; // scene header line, null for preamble
  body: string;
}

// Parse "== 场景 N：标题 ==" markers into display blocks.
function parseBlocks(text: string): Block[] {
  const lines = text.split("\n");
  const blocks: Block[] = [];
  let current: Block | null = null;
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
  if (blocks.length === 0) blocks.push({ head: null, body: text });
  return blocks;
}

function serialize(blocks: Block[]): string {
  return blocks
    .map((b) => (b.head ? `== ${b.head} ==\n${b.body}` : b.body))
    .join("\n\n")
    .trim();
}

export function ScriptEditor({
  projectId,
  initialContent,
}: {
  projectId: string;
  initialContent: string;
}) {
  const router = useRouter();
  const [blocks, setBlocks] = useState<Block[]>(() => parseBlocks(initialContent));
  const [saving, setSaving] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const persist = useCallback(
    (next: Block[]) => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(async () => {
        setSaving(true);
        await fetch(`/api/projects/${projectId}/script`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: serialize(next) }),
        }).catch(() => {});
        setSaving(false);
      }, 600);
    },
    [projectId]
  );

  function editBody(i: number, body: string) {
    setBlocks((bs) => {
      const next = bs.map((b, idx) => (idx === i ? { ...b, body } : b));
      persist(next);
      return next;
    });
  }

  async function confirmScript() {
    setConfirming(true);
    setError(null);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    await fetch(`/api/projects/${projectId}/script`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: serialize(blocks) }),
    }).catch(() => {});
    try {
      const res = await fetch(`/api/projects/${projectId}/script/confirm`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "确认失败");
      }
      router.push(`/app/projects/${projectId}/scenes`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "确认失败");
      setConfirming(false);
    }
  }

  return (
    <section className="panel-script">
      <div className="script-layout">
        <div className="script-main">
          <div className="script-doc">
            {blocks.map((b, i) => (
              <div key={i}>
                {b.head && <div className="scene-head">{b.head}</div>}
                <p
                  className="script-para"
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => editBody(i, e.currentTarget.textContent ?? "")}
                >
                  {b.body}
                </p>
              </div>
            ))}
          </div>
        </div>

        <ScriptChatPanel
          projectId={projectId}
          getContent={() => serialize(blocks)}
          onApply={(text) => {
            const next = parseBlocks(text);
            setBlocks(next);
            persist(next);
          }}
        />
      </div>

      <div className="action-bar">
        <div className="ab-left">
          <span style={{ fontSize: 12, color: "var(--muted)", alignSelf: "center" }}>
            {saving ? "保存中…" : "已保存"}
          </span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {error && (
            <span style={{ color: "var(--err)", fontSize: 13, alignSelf: "center" }}>
              {error}
            </span>
          )}
          <button className="btn-p" onClick={confirmScript} disabled={confirming}>
            {confirming ? "生成场景中…" : "确认剧本，进入场景 →"}
          </button>
        </div>
      </div>
    </section>
  );
}

function ScriptChatPanel({
  projectId,
  getContent,
  onApply,
}: {
  projectId: string;
  getContent: () => string;
  onApply: (text: string) => void;
}) {
  const [input, setInput] = useState("");
  const [feed, setFeed] = useState<{ role: "viby" | "user"; text: string }[]>([
    { role: "viby", text: "剧本已生成。需要调整节奏、增删场景，或改某段氛围，告诉我就行。" },
  ]);
  const [busy, setBusy] = useState(false);

  async function send() {
    const instruction = input.trim();
    if (!instruction) return;
    setInput("");
    setFeed((f) => [...f, { role: "user", text: instruction }]);
    setBusy(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/script/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instruction, content: getContent() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "调整失败");
      if (typeof data.content === "string") {
        onApply(data.content);
        setFeed((f) => [
          ...f,
          { role: "viby", text: "好的，我已根据你的要求调整了对应段落，可在左侧查看。" },
        ]);
      }
    } catch (e) {
      setFeed((f) => [
        ...f,
        { role: "viby", text: e instanceof Error ? e.message : "调整失败" },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <aside className="script-aside">
      <div className="aside-title">和 AI 一起调整剧本</div>
      <div className="aside-sub">描述你想改动的地方，Viby 会帮你重写对应段落。</div>
      <div className="ai-feed">
        {feed.map((m, i) => (
          <div key={i} className={`ai-bubble ${m.role}`}>
            {m.text}
          </div>
        ))}
        {busy && <div className="ai-bubble viby">正在调整…</div>}
      </div>
      <div className="ai-input-row">
        <input
          className="ai-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="你希望改动什么？"
        />
        <button className="ai-send" onClick={send} disabled={busy}>
          发送
        </button>
      </div>
    </aside>
  );
}
