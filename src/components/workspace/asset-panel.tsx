"use client";

import { useState } from "react";

export interface AssetPanelData {
  id: string;
  name: string;
  asset_type: "character" | "scene" | "prop" | "style";
  description: string | null;
  image_url: string | null;
  status: string;
}

const PROMPTS: Record<string, string> = {
  character: "描述角色外貌：发型、肤色、五官特征、服装风格，越具体越好。",
  scene: "描述空旷的空间本身：房间陈设、光线方向、材质、色温，不要写人物。",
  prop: "描述道具的外形、材质、颜色和细节。",
  style: "描述整片的色彩基调：暖调/冷调、饱和度高低、胶片感/数码感、光线质感。例如：暖橙低饱和、自然光、轻微胶片颗粒感。",
};

export function AssetPanel({
  projectId,
  asset,
  onClose,
  onSaved,
}: {
  projectId: string;
  asset: AssetPanelData;
  onClose: () => void;
  onSaved: (assetId: string, imageUrl: string) => void;
}) {
  const [description, setDescription] = useState(asset.description ?? "");
  const [imageUrl, setImageUrl] = useState<string | null>(asset.image_url);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const status = busy ? "生成中" : imageUrl ? "已生成" : "未生成";

  async function generate() {
    if (!description.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/projects/${projectId}/assets/${asset.id}/generate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ description: description.trim() }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "生成失败");
      setImageUrl(data.imageUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : "生成失败");
    } finally {
      setBusy(false);
    }
  }

  async function upload(file: File) {
    setBusy(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(
        `/api/projects/${projectId}/assets/${asset.id}/upload`,
        { method: "POST", body: form }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "上传失败");
      setImageUrl(data.imageUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : "上传失败");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="vbyws-drawer-scrim open" onClick={onClose} />
      <aside className="vbyws-drawer open" role="dialog" aria-modal="true">
        <div className="drawer-head">
          <span className="drawer-title">资产：{asset.name}</span>
          <button className="drawer-close" onClick={onClose} aria-label="关闭">
            ×
          </button>
        </div>
        <div className="drawer-body">
          <div className="drawer-status">当前状态：{status}</div>
          <div className="drawer-bubble">{PROMPTS[asset.asset_type] ?? "描述一下这个资产，越具体越好。"}</div>

          <div className="drawer-input-row">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="例如：男性，30 岁左右，疲惫的脸，旧款白色航天服，头盔夹在腋下…"
            />
            <button className="btn-p" onClick={generate} disabled={busy || !description.trim()}>
              {busy ? "生成中…" : imageUrl ? "重新生成" : "生成"}
            </button>
          </div>

          <div className="dp-label">预览</div>
          <div className={`dp-frame${imageUrl ? " done" : ""}${busy ? " gen" : ""}`}>
            {busy ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, height: "100%" }}>
                <span style={{ width: 16, height: 16, border: "2px solid var(--border)", borderTopColor: "var(--accent)", borderRadius: "50%", display: "inline-block", animation: "viby-spin 0.6s linear infinite" }} />
                <span style={{ fontSize: 13, color: "var(--muted)", fontFamily: "var(--font-mono)" }}>生成中…</span>
              </div>
            ) : imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageUrl} alt={asset.name} />
            ) : (
              <span className="dp-hint">生成后显示在这里</span>
            )}
          </div>

          {error && <p style={{ color: "var(--err)", fontSize: 13, marginBottom: 12 }}>{error}</p>}

          {imageUrl && (
            <div className="dp-actions">
              <button className="btn-s" onClick={generate} disabled={busy}>
                重新生成
              </button>
              <button
                className="btn-s solid"
                onClick={() => {
                  onSaved(asset.id, imageUrl);
                  onClose();
                }}
              >
                使用这张
              </button>
              <label className="btn-s" style={{ cursor: "pointer" }}>
                上传替换
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void upload(f);
                  }}
                />
              </label>
            </div>
          )}
          {!imageUrl && (
            <div className="dp-actions" style={{ display: "flex" }}>
              <label className="btn-s solid" style={{ cursor: "pointer" }}>
                上传参考图
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void upload(f);
                  }}
                />
              </label>
              <span style={{ fontSize: 12, color: "var(--muted)", alignSelf: "center" }}>
                或填写描述后用 AI 生成
              </span>
            </div>
          )}
        </div>
      </aside>
      <style>{`@keyframes viby-spin{to{transform:rotate(360deg)}}`}</style>
    </>
  );
}
