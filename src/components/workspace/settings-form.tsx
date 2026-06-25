"use client";

import { useState } from "react";

export function SettingsForm({
  initialMode,
  initialBaseUrl,
}: {
  initialMode: "viby_ai" | "byok";
  initialBaseUrl: string;
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
      <p className="kicker">AI 模式</p>
      <div className="mode-row">
        <button
          className={`mode-opt${mode === "byok" ? " active" : ""}`}
          onClick={() => setMode("byok")}
        >
          <span className="mode-dot" />
          自定义 Key
        </button>
        <button
          className={`mode-opt${mode === "viby_ai" ? " active" : ""}`}
          onClick={() => setMode("viby_ai")}
        >
          <span className="mode-dot" />
          Viby Credit
        </button>
      </div>

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
    </>
  );
}
