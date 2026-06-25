"use client";

import { useState } from "react";

export interface ExportChecklistItem {
  key: string;
  label: string;
  path: string;
  available: boolean;
}

const CHECK = (
  <svg viewBox="0 0 24 24">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export function ExportPanel({
  projectId,
  checklist,
  missingAssets,
}: {
  projectId: string;
  checklist: ExportChecklistItem[];
  missingAssets: string[];
}) {
  const [checked, setChecked] = useState<Record<string, boolean>>(
    Object.fromEntries(checklist.map((c) => [c.key, c.available]))
  );
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [warnDimmed, setWarnDimmed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggle(key: string) {
    setChecked((c) => ({ ...c, [key]: !c[key] }));
  }

  async function download() {
    setBusy(true);
    setError(null);
    setProgress(20);
    setProgressLabel("整理剧本与分镜…");
    try {
      const res = await fetch(`/api/projects/${projectId}/export`, {
        method: "POST",
      });
      setProgress(70);
      setProgressLabel("压缩 ZIP…");
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "导出失败");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "viby-project.zip";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setProgress(100);
      setProgressLabel("下载已开始");
    } catch (e) {
      setError(e instanceof Error ? e.message : "导出失败");
      setProgressLabel("");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <p className="kicker">包含内容</p>
      <div className="checklist">
        {checklist.map((item) => {
          const on = checked[item.key];
          return (
            <div className="check-item" key={item.key} onClick={() => toggle(item.key)}>
              <div className={`check-box ${on ? "on" : "off"}`}>{on && CHECK}</div>
              <span className="check-name">{item.label}</span>
              <span className="check-path">{item.path}</span>
            </div>
          );
        })}
      </div>

      {missingAssets.length > 0 && (
        <div className="warn-box" style={{ opacity: warnDimmed ? 0.5 : 1 }}>
          <div className="warn-title">⚠ 以下内容未生成，导出包中不包含：</div>
          <ul className="warn-list">
            {missingAssets.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
          <div className="warn-actions">
            <a className="warn-btn" href={`/app/projects/${projectId}`}>
              返回补充
            </a>
            <button className="warn-btn skip" onClick={() => setWarnDimmed(true)}>
              忽略，继续导出
            </button>
          </div>
        </div>
      )}

      {error && <p style={{ color: "var(--err)", fontSize: 13, marginBottom: 16 }}>{error}</p>}

      <div className="export-bar">
        {(busy || progress > 0) && (
          <div className="ex-prog">
            <span className="ex-prog-lbl">{progressLabel}</span>
            <div className="ex-prog-bar">
              <div className="ex-prog-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}
        <a href={`/app/projects/${projectId}`} className="btn-g">
          取消
        </a>
        <button className="btn-p" onClick={download} disabled={busy}>
          {busy ? "打包中…" : "下载 ZIP"}
        </button>
      </div>
    </>
  );
}
