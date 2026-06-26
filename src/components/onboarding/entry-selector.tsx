"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChatGuide } from "./chat-guide";

type EntryMode = "idea" | "script";
type Phase = "select" | "idea-flow" | "script-input";

export function EntrySelector() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("select");
  const [script, setScript] = useState("");
  const [title, setTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Idea path: clicking the card jumps straight into the guided form.
  // The first step of the guide IS the idea input, so we don't ask for
  // the idea here anymore — no double-entry.
  function chooseIdea() {
    setPhase("idea-flow");
  }

  // Script path: show the script textarea here, then create project.
  function chooseScript() {
    setPhase("script-input");
  }

  async function submitScript() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entryMode: "script",
          title: title.trim() || script.trim().slice(0, 20),
          rawInput: script.trim(),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "创建项目失败");
      }
      const data = await res.json();
      router.push(`/app/projects/${data.projectId}/scenes`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "创建项目失败");
      setSubmitting(false);
    }
  }

  // ── Phase: guided idea flow ──
  if (phase === "idea-flow") {
    return <ChatGuide title="" />;
  }

  // ── Phase: script input ──
  if (phase === "script-input") {
    return (
      <div className="entry-wrap">
        <h1 className="entry-q">粘贴你的完整剧本</h1>
        <p className="entry-qs">系统将直接解析剧本内容，不会再重新生成。</p>

        <input
          className="entry-title-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="项目标题（可选，留空则取剧本前 20 字）"
        />
        <textarea
          className="entry-textarea"
          style={{ minHeight: 240 }}
          value={script}
          onChange={(e) => setScript(e.target.value)}
          placeholder="粘贴你的完整剧本…"
          autoFocus
        />
        <div className="entry-warn">
          <span>⚠</span>
          <span>选择此入口后系统不会再生成剧本，将直接进入场景解析。</span>
        </div>

        {error && (
          <p style={{ color: "var(--err)", fontSize: 13, marginBottom: 16 }}>{error}</p>
        )}

        <div className="entry-start-row">
          <button
            type="button"
            className="btn-g"
            onClick={() => setPhase("select")}
            disabled={submitting}
          >
            ← 返回选择
          </button>
          <button
            type="button"
            className="btn-primary"
            disabled={!script.trim() || submitting}
            onClick={submitScript}
          >
            {submitting ? "创建中…" : "开始解析 →"}
          </button>
        </div>
      </div>
    );
  }

  // ── Phase: entry selection (default) ──
  return (
    <div className="entry-wrap">
      <h1 className="entry-q">你现在手上有什么？</h1>
      <p className="entry-qs">选择你的起点，Viby 会用对应的方式帮你往下走。</p>

      <div className="entry-cards">
        <button
          type="button"
          className="entry-card"
          onClick={chooseIdea}
        >
          <span className="entry-check" />
          <svg className="entry-card-ico" viewBox="0 0 24 24">
            <path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.1V18h6v-1.2c0-.8.4-1.6 1-2.1A7 7 0 0 0 12 2z" />
          </svg>
          <div className="entry-card-t">我有一个想法</div>
          <div className="entry-card-d">
            一句话或故事梗概都可以，系统会通过几个问题帮你生成完整剧本。
          </div>
          <div className="entry-card-cta">开始 →</div>
        </button>

        <button
          type="button"
          className="entry-card"
          onClick={chooseScript}
        >
          <span className="entry-check" />
          <svg className="entry-card-ico" viewBox="0 0 24 24">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <path d="M14 2v6h6M8 13h8M8 17h8M8 9h2" />
          </svg>
          <div className="entry-card-t">我已有完整剧本</div>
          <div className="entry-card-d">
            系统将直接解析你的剧本内容，不会再重新生成剧本。
          </div>
          <div className="entry-card-cta">粘贴剧本 →</div>
        </button>
      </div>
    </div>
  );
}
