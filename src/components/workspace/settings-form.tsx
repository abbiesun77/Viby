"use client";

import { useState } from "react";
import { COSTS } from "../../lib/credits";

// ── Provider presets ────────────────────────────────────────────────────────
const TEXT_PRESETS = [
  { label: "OpenAI 官方",     url: "https://api.openai.com/v1",        model: "gpt-4o" },
  { label: "Anthropic 官方",  url: "https://api.anthropic.com",        model: "claude-sonnet-4-6" },
  { label: "DeepSeek 官方",   url: "https://api.deepseek.com/v1",      model: "deepseek-chat" },
  { label: "中转站 / 自定义", url: "",                                  model: "" },
] as const;

const IMAGE_PRESETS = [
  { label: "Right Code Draw", url: "https://www.right.codes/draw",     model: "" },
  { label: "OpenAI DALL-E",   url: "https://api.openai.com/v1",        model: "dall-e-3" },
  { label: "中转站 / 自定义", url: "",                                  model: "" },
] as const;

// ── Types ───────────────────────────────────────────────────────────────────
interface ProviderConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
}

export function SettingsForm({
  initialMode,
  initialText,
  initialImage,
  creditBalance,
}: {
  initialMode: "viby_ai" | "byok";
  initialText: ProviderConfig;
  initialImage: ProviderConfig;
  creditBalance: number;
}) {
  const [mode, setMode] = useState<"viby_ai" | "byok">(initialMode);
  const [text, setText] = useState<ProviderConfig>(initialText);
  const [image, setImage] = useState<ProviderConfig>(initialImage);
  const [showTextKey, setShowTextKey] = useState(false);
  const [showImageKey, setShowImageKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function applyTextPreset(i: number) {
    const p = TEXT_PRESETS[i];
    setText((s) => ({ ...s, baseUrl: p.url, model: p.model }));
  }
  function applyImagePreset(i: number) {
    const p = IMAGE_PRESETS[i];
    setImage((s) => ({ ...s, baseUrl: p.url, model: p.model }));
  }

  async function save() {
    if (mode === "byok" && (!text.baseUrl.trim() || !text.apiKey.trim())) {
      setError("请填写文本 AI 的 Base URL 和 API Key");
      return;
    }
    setSaving(true); setError(null); setNote(null);
    try {
      const res = await fetch("/api/settings/ai-mode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          byokBaseUrl: text.baseUrl,
          byokApiKey: text.apiKey,
          byokTextModel: text.model || undefined,
          byokImageBaseUrl: image.baseUrl || undefined,
          byokImageApiKey: image.apiKey || undefined,
          byokImageModel: image.model || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.[0]?.message ?? "保存失败");
      setNote(mode === "byok" ? "✓ 已切换到自定义 Key" : "✓ 已切换到 Viby Credit");
    } catch (e) {
      setError(e instanceof Error ? e.message : "保存失败");
    } finally { setSaving(false); }
  }

  return (
    <>
      <div className="mode-row">
        <button className={`mode-opt${mode === "viby_ai" ? " active" : ""}`} onClick={() => setMode("viby_ai")}>
          <span className="mode-dot" /> Viby Credit
        </button>
        <button className={`mode-opt${mode === "byok" ? " active" : ""}`} onClick={() => setMode("byok")}>
          <span className="mode-dot" /> 自定义 Key
        </button>
      </div>

      {mode === "viby_ai" && (
        <div className="settings-sec">
          <div>
            <span className="credit-big">{creditBalance}</span>
            <span className="credit-u">点</span>
          </div>
          <div className="credit-note">Credit 耗尽后请切换到自定义 Key 继续创作。</div>
          <div className="cost-table">
            {[
              ["生成剧本", COSTS.script_generation],
              ["生成场景 & 分镜", COSTS.scene_generation],
              ["生成参考图", COSTS.asset_generation],
              ["生成 Storyboard", COSTS.storyboard_generation],
            ].map(([k, v]) => (
              <div className="cost-row" key={String(k)}>
                <span className="cost-k">{k}</span>
                <span className="cost-v">约 {v} 点</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {mode === "byok" && (
        <>
          {/* ── 文本 AI ─────────────────────────────────────── */}
          <div className="settings-sec">
            <div className="byok-section-label">文本 AI（剧本 / 场景 / 分析）</div>
            <div className="byok-presets">
              {TEXT_PRESETS.map((p, i) => (
                <button
                  key={p.label}
                  className={`byok-preset${text.baseUrl === p.url && p.url ? " active" : ""}`}
                  onClick={() => applyTextPreset(i)}
                >{p.label}</button>
              ))}
            </div>
            <ProviderFields
              config={text}
              onChange={setText}
              showKey={showTextKey}
              onToggleKey={() => setShowTextKey((s) => !s)}
              urlPlaceholder="https://api.openai.com/v1"
              modelPlaceholder="gpt-4o"
            />
          </div>

          {/* ── 图像 AI ─────────────────────────────────────── */}
          <div className="settings-sec">
            <div className="byok-section-label">图像 AI（参考图 / Storyboard）</div>
            <div className="byok-presets">
              {IMAGE_PRESETS.map((p, i) => (
                <button
                  key={p.label}
                  className={`byok-preset${image.baseUrl === p.url && p.url ? " active" : ""}`}
                  onClick={() => applyImagePreset(i)}
                >{p.label}</button>
              ))}
            </div>
            <div className="byok-fallback-note">未填写时自动复用文本 AI 的配置</div>
            <ProviderFields
              config={image}
              onChange={setImage}
              showKey={showImageKey}
              onToggleKey={() => setShowImageKey((s) => !s)}
              urlPlaceholder="https://www.right.codes/draw"
              modelPlaceholder="留空则使用默认模型"
            />
          </div>

          <div className="settings-sec">
            <button className="btn-p" onClick={save} disabled={saving}>
              {saving ? (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 14, height: 14, border: "1.5px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "viby-spin 0.6s linear infinite" }} />
                  保存中
                </span>
              ) : "保存"}
            </button>
            {note && <div className="save-note">{note}</div>}
            {error && <div className="save-note" style={{ color: "var(--err)" }}>{error}</div>}
          </div>
        </>
      )}
      <style>{`@keyframes viby-spin{to{transform:rotate(360deg)}}`}</style>
    </>
  );
}

function ProviderFields({
  config,
  onChange,
  showKey,
  onToggleKey,
  urlPlaceholder,
  modelPlaceholder,
}: {
  config: ProviderConfig;
  onChange: (c: ProviderConfig) => void;
  showKey: boolean;
  onToggleKey: () => void;
  urlPlaceholder: string;
  modelPlaceholder: string;
}) {
  return (
    <>
      <div className="set-field">
        <label>Base URL</label>
        <input type="url" value={config.baseUrl} onChange={(e) => onChange({ ...config, baseUrl: e.target.value })} placeholder={urlPlaceholder} />
      </div>
      <div className="set-field">
        <label>API Key</label>
        <div className="input-wrap">
          <input
            type={showKey ? "text" : "password"}
            value={config.apiKey}
            onChange={(e) => onChange({ ...config, apiKey: e.target.value })}
            placeholder="sk-..."
          />
          <button className="toggle-vis" onClick={onToggleKey}>{showKey ? "隐藏" : "显示"}</button>
        </div>
      </div>
      <div className="set-field">
        <label>模型名称 <span style={{ color: "var(--muted)", fontWeight: 400 }}>(可选)</span></label>
        <input type="text" value={config.model} onChange={(e) => onChange({ ...config, model: e.target.value })} placeholder={modelPlaceholder} />
      </div>
    </>
  );
}
