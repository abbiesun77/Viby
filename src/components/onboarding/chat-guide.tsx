"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";

gsap.registerPlugin(useGSAP);

const CONTENT_TYPE_OPTIONS = [
  { value: "达人短视频", desc: "KOL 合作参考 / 自媒体起号" },
  { value: "品牌 Commercial", desc: "产品推广 / 品牌形象" },
  { value: "微短剧/剧情", desc: "情节驱动的短视频内容" },
  { value: "MV / 创意短片", desc: "音乐视频 / 实验性表达" },
];

const VISUAL_FEEL_OPTIONS = [
  { value: "真人感", desc: "自然光、手持、无 AI 感" },
  { value: "电影感", desc: "宽银幕、精心构图、胶片质感" },
  { value: "广告精修感", desc: "高对比、完美打光、商业调色" },
  { value: "Vlog感", desc: "轻松随性、日常氛围" },
];

const DURATION_OPTIONS = [
  { value: "15秒", desc: "短视频平台" },
  { value: "30秒", desc: "标准广告" },
  { value: "60秒", desc: "完整短片" },
];

const MOOD_SUGGESTIONS = ["孤寂、带点温情", "热血、燃", "克制、冷峻", "荒诞、幽默", "温暖、治愈"];

type Step = 0 | 1 | 2 | 3 | 4;

interface FormData {
  idea: string;
  contentType: string;
  visualFeel: string;
  duration: string;
  customDuration: string;
  mood: string;
}

export function ChatGuide({ idea, title }: { idea?: string; title?: string }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(0);
  const [dir, setDir] = useState<"fwd" | "bwd">("fwd");
  const [data, setData] = useState<FormData>({
    idea: idea ?? "",
    contentType: "",
    visualFeel: "",
    duration: "",
    customDuration: "",
    mood: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const genCardRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (step !== 4) return;
      gsap.fromTo(
        ".guide-gen > *",
        { autoAlpha: 0, y: 16 },
        { autoAlpha: 1, y: 0, duration: 0.4, ease: "power2.out", stagger: 0.12 }
      );
    },
    { scope: genCardRef, dependencies: [step] }
  );

  const canNext =
    step === 0
      ? data.idea.trim().length > 0
      : step === 1
        ? Boolean(data.contentType && data.visualFeel)
        : step === 2
          ? Boolean(data.duration || data.customDuration.trim())
          : step === 3
            ? data.mood.trim().length > 0
            : false;

  function goNext() {
    if (!canNext) return;
    setDir("fwd");
    if (step === 3) {
      void submit();
    } else {
      setStep((s) => (s + 1) as Step);
    }
  }

  function goBack() {
    setDir("bwd");
    setStep((s) => Math.max(0, s - 1) as Step);
  }

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setData((d) => ({ ...d, [key]: value }));
  }

  async function submit() {
    setGenerating(true);
    setError(null);
    setStep(4);
    const finalDuration = data.customDuration.trim() || data.duration;
    const finalTitle = (title ?? "").trim() || data.idea.trim().slice(0, 20);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entryMode: "idea",
          title: finalTitle,
          rawInput: data.idea,
          style: data.visualFeel,         // backward compat
          duration: finalDuration,
          mood: data.mood.trim(),
          contentType: data.contentType,
          visualFeel: data.visualFeel,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "生成剧本失败");
      }
      const result = await res.json();
      router.push(`/app/projects/${result.projectId}/script`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "生成剧本失败");
      setGenerating(false);
      setStep(3);
    }
  }

  return (
    <div className="guide-wrap">
      <div className="guide-topbar">
        <button className="btn-g guide-back" onClick={() => router.push("/app/new")}>
          ← 返回选择
        </button>
        <div className="guide-progress">
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className={`guide-dot${i === step ? " cur" : i < step ? " done" : ""}`}
            />
          ))}
        </div>
      </div>

      <div className="guide-stage">
        {step === 0 && (
          <div key="s0" className={`guide-card ${dir}`}>
            <div className="guide-step-label">第 1 步，共 4 步</div>
            <h2 className="guide-q">先确认你的想法</h2>
            <p className="guide-hint">这是 Viby 生成剧本的起点，随时可以回头改。</p>
            <textarea
              className="guide-textarea"
              value={data.idea}
              autoFocus
              onChange={(e) => set("idea", e.target.value)}
              placeholder="例如：一个失业宇航员在便利店遇见了未来的自己"
            />
          </div>
        )}

        {step === 1 && (
          <div key="s1" className={`guide-card ${dir}`}>
            <div className="guide-step-label">第 2 步，共 4 步</div>
            <h2 className="guide-q">内容类型 + 画面质感</h2>
            <p className="guide-hint">这两个选择会影响 AI 的叙事结构和视觉描述方式。</p>

            <p className="kicker" style={{ marginBottom: 10 }}>内容类型</p>
            <div className="guide-options" style={{ marginBottom: 20 }}>
              {CONTENT_TYPE_OPTIONS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  className={`guide-opt${data.contentType === c.value ? " sel" : ""}`}
                  onClick={() => set("contentType", c.value)}
                >
                  <span className="guide-opt-t">{c.value}</span>
                  <span className="guide-opt-d">{c.desc}</span>
                </button>
              ))}
            </div>

            <p className="kicker" style={{ marginBottom: 10 }}>画面质感</p>
            <div className="guide-options">
              {VISUAL_FEEL_OPTIONS.map((v) => (
                <button
                  key={v.value}
                  type="button"
                  className={`guide-opt${data.visualFeel === v.value ? " sel" : ""}`}
                  onClick={() => set("visualFeel", v.value)}
                >
                  <span className="guide-opt-t">{v.value}</span>
                  <span className="guide-opt-d">{v.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div key="s2" className={`guide-card ${dir}`}>
            <div className="guide-step-label">第 3 步，共 4 步</div>
            <h2 className="guide-q">大概多长？</h2>
            <p className="guide-hint">影响场景密度和节奏。</p>
            <div className="guide-options guide-options-row">
              {DURATION_OPTIONS.map((d) => (
                <button
                  key={d.value}
                  type="button"
                  className={`guide-opt guide-opt-sm${data.duration === d.value ? " sel" : ""}`}
                  onClick={() => { set("duration", d.value); set("customDuration", ""); }}
                >
                  <span className="guide-opt-t">{d.value}</span>
                  <span className="guide-opt-d">{d.desc}</span>
                </button>
              ))}
            </div>
            <div className="guide-custom">
              <input
                className="guide-input"
                placeholder="自定义时长，例如 90 秒"
                value={data.customDuration}
                onChange={(e) => { set("customDuration", e.target.value); if (e.target.value) set("duration", ""); }}
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div key="s3" className={`guide-card ${dir}`}>
            <div className="guide-step-label">第 4 步，共 4 步</div>
            <h2 className="guide-q">情绪基调是什么？</h2>
            <p className="guide-hint">用几个形容词描述就行，也可以从下面选一个再改。</p>
            <div className="guide-chips">
              {MOOD_SUGGESTIONS.map((m) => (
                <button
                  key={m}
                  type="button"
                  className={`guide-chip${data.mood === m ? " sel" : ""}`}
                  onClick={() => set("mood", m)}
                >
                  {m}
                </button>
              ))}
            </div>
            <input
              className="guide-input"
              placeholder="例如：孤寂、荒诞、带点温情"
              value={data.mood}
              autoFocus
              onChange={(e) => set("mood", e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && goNext()}
            />
          </div>
        )}

        {step === 4 && (
          <div key="s4" className="guide-card fwd" ref={genCardRef}>
            <div className="guide-gen">
              <div className="guide-gen-spinner" />
              <h2 className="guide-q">正在为你生成剧本…</h2>
              <p className="guide-hint">
                {data.contentType} · {data.visualFeel} · {data.customDuration || data.duration} · {data.mood}
              </p>
            </div>
          </div>
        )}
      </div>

      {error && <p className="guide-error" style={{ color: "var(--err)" }}>{error}</p>}

      {!generating && step < 4 && (
        <div className="guide-nav">
          {step > 0 ? (
            <button className="btn-g" onClick={goBack}>← 上一步</button>
          ) : <span />}
          <button className="btn-p" onClick={goNext} disabled={!canNext}>
            {step === 3 ? "生成剧本 →" : "下一步 →"}
          </button>
        </div>
      )}
    </div>
  );
}
