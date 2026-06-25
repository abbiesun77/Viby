"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STYLE_OPTIONS = ["写实纪录感", "电影感", "广告感", "动画/插画感"];
const DURATION_OPTIONS = ["15秒", "30秒", "60秒", "自定义…"];

interface Msg {
  role: "viby" | "user";
  text: string;
}

export function ChatGuide({ idea, title }: { idea: string; title: string }) {
  const router = useRouter();
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "viby", text: "你想拍什么风格的视频？" },
  ]);
  const [phase, setPhase] = useState<
    "style" | "duration" | "customDur" | "mood" | "generating" | "done"
  >("style");
  const [style, setStyle] = useState("");
  const [duration, setDuration] = useState("");
  const [customDur, setCustomDur] = useState("");
  const [mood, setMood] = useState("");
  const [error, setError] = useState<string | null>(null);

  const progress =
    phase === "style"
      ? "步骤 1/4：了解你的想法"
      : phase === "duration" || phase === "customDur"
        ? "步骤 2/4：确定时长"
        : phase === "mood"
          ? "步骤 3/4：定下情绪基调"
          : "步骤 4/4：生成剧本";

  function pushUser(text: string) {
    setMsgs((m) => [...m, { role: "user", text }]);
  }
  function pushViby(text: string) {
    setMsgs((m) => [...m, { role: "viby", text }]);
  }

  function chooseStyle(s: string) {
    setStyle(s);
    pushUser(s);
    pushViby("大概多长？");
    setPhase("duration");
  }

  function chooseDuration(d: string) {
    if (d === "自定义…") {
      setPhase("customDur");
      return;
    }
    setDuration(d);
    pushUser(d);
    pushViby("情绪基调呢？用形容词描述就行。");
    setPhase("mood");
  }

  function submitCustomDur() {
    const v = customDur.trim() || "自定义";
    setDuration(v);
    pushUser(v);
    pushViby("情绪基调呢？用形容词描述就行。");
    setPhase("mood");
  }

  async function submitMood() {
    const v = mood.trim();
    if (!v) return;
    pushUser(v);
    setPhase("generating");
    setError(null);
    pushViby("好，我来帮你生成剧本…");

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entryMode: "idea",
          title,
          rawInput: idea,
          style,
          duration,
          mood: v,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "生成剧本失败");
      }
      const data = await res.json();
      router.push(`/app/projects/${data.projectId}/script`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "生成剧本失败");
      setPhase("mood");
    }
  }

  return (
    <div className="chat-wrap">
      <div className="chat-progress">{progress}</div>
      <div className="chat-feed">
        {msgs.map((m, i) => (
          <div key={i} className={`bubble ${m.role}`}>
            {m.role === "viby" && <span className="bubble-label">Viby</span>}
            {m.text}
            {m.role === "viby" && phase === "generating" && i === msgs.length - 1 && (
              <span className="dots">
                <span /><span /><span />
              </span>
            )}
          </div>
        ))}

        {phase === "style" && (
          <div className="chips">
            {STYLE_OPTIONS.map((s) => (
              <button key={s} type="button" className="chip" onClick={() => chooseStyle(s)}>
                {s}
              </button>
            ))}
          </div>
        )}

        {phase === "duration" && (
          <div className="chips">
            {DURATION_OPTIONS.map((d) => (
              <button
                key={d}
                type="button"
                className={`chip${d === "自定义…" ? " muted" : ""}`}
                onClick={() => chooseDuration(d)}
              >
                {d}
              </button>
            ))}
          </div>
        )}

        {phase === "customDur" && (
          <div className="chat-input-row">
            <input
              className="chat-input"
              autoFocus
              value={customDur}
              onChange={(e) => setCustomDur(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitCustomDur()}
              placeholder="例如：90 秒"
            />
            <button className="chat-send" type="button" onClick={submitCustomDur}>
              确定
            </button>
          </div>
        )}

        {phase === "mood" && (
          <div className="chat-input-row">
            <input
              className="chat-input"
              autoFocus
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitMood()}
              placeholder="例如：孤寂、荒诞、带点温情"
            />
            <button className="chat-send" type="button" onClick={submitMood}>
              发送
            </button>
          </div>
        )}

        {error && <p style={{ color: "var(--err)", fontSize: 13 }}>{error}</p>}
      </div>
    </div>
  );
}
