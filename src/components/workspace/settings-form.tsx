"use client";

import { useState } from "react";
import { COSTS } from "../../lib/credits";

export function SettingsForm({
  initialMode,
  initialBaseUrl,
  creditBalance,
}: {
  initialMode: "viby_ai" | "byok";
  initialBaseUrl: string;
  creditBalance: number;
}) {
  const [mode, setMode] = useState<"viby_ai" | "byok">(initialMode);
  const [baseUrl, setBaseUrl] = useState(initialBaseUrl);
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    if (mode === "byok" && (!baseUrl.trim() || !apiKey.trim())) {
      setError("请填写 Base URL 和 API Key");
      return;
    }
    setSaving(true);
    setError(null);
    setNote(null);
    try {
      const res = await fetch("/api/settings/ai-mode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, byokBaseUrl: baseUrl, byokApiKey: apiKey }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.[0]?.message ?? "保存失败");
      setNote(mode === "byok" ? "✓ 已切换到自定义 Key" : "✓ 已切换到 Viby Credit");
    } catch (e) {
      setError(e instanceof Error ? e.message : "保存失败");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      {/* ── Mode switcher ── */}
      <div className="mode-row">
        <button
          className={`mode-opt${mode === "viby_ai" ? " active" : ""}`}
          onClick={() => setMode("viby_ai")}
        >
          <span className="mode-dot" />
          Viby Credit
        </button>
        <button
          className={`mode-opt${mode === "byok" ? " active" : ""}`}
          onClick={() => setMode("byok")}
        >
          <span className="mode-dot" />
          自定义 Key
        </button>
      </div>

      {/* ── Viby Credit panel ── */}
      {mode === "viby_ai" && (
        <div className="settings-sec">
          <div>
            <span className="credit-big">{creditBalance}</span>
            <span className="credit-u">点</span>
          </div>
          <div className="credit-note">
            Credit 耗尽后请切换到自定义 Key 继续创作。
          </div>
          <div className="cost-table">
            <div className="cost-row">
              <span className="cost-k">生成剧本</span>
              <span className="cost-v">约 {COSTS.script_generation} 点</span>
            </div>
            <div className="cost-row">
              <span className="cost-k">生成场景 &amp; 分镜</span>
              <span className="cost-v">约 {COSTS.scene_generation} 点</span>
            </div>
            <div className="cost-row">
              <span className="cost-k">生成参考图</span>
              <span className="cost-v">约 {COSTS.asset_generation} 点</span>
            </div>
            <div className="cost-row">
              <span className="cost-k">生成 Storyboard</span>
              <span className="cost-v">约 {COSTS.storyboard_generation} 点</span>
            </div>
          </div>
        </div>
      )}

      {/* ── BYOK panel ── */}
      {mode === "byok" && (
        <div className="settings-sec">
          <div className="set-field">
            <label>API Base URL（OpenAI 兼容）</label>
            <div className="input-wrap">
              <input
                type="url"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="https://api.openai.com/v1"
              />
            </div>
          </div>
          <div className="set-field">
            <label>API Key</label>
            <div className="input-wrap">
              <input
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
              />
              <button className="toggle-vis" onClick={() => setShowKey((s) => !s)}>
                {showKey ? "隐藏" : "显示"}
              </button>
            </div>
          </div>
          <button className="btn-p" onClick={save} disabled={saving}>
            {saving ? "保存中…" : "保存"}
          </button>
          {note && <div className="save-note">{note}</div>}
          {error && <div className="save-note" style={{ color: "var(--err)" }}>{error}</div>}
        </div>
      )}
    </>
  );
}
