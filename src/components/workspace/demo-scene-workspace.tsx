"use client";

import { useState } from "react";
import { demoScenes, demoShots, demoAssets } from "../../lib/demo-data";

const FRAMING_OPTIONS = ["远景", "全景", "中景", "近景", "特写", "双人中景"];

/**
 * Demo-mode scene workspace with full interactivity:
 * - Expand/collapse scene blocks (works!)
 * - Click a shot to edit it in the right panel
 * - Right panel shows shot editor (read-only in demo, but UI is complete)
 */
export function DemoSceneWorkspace() {
  const [openScenes, setOpenScenes] = useState<Set<string>>(
    new Set([demoScenes[0]?.id])
  );
  const [selectedShot, setSelectedShot] = useState<typeof demoShots[0] | null>(null);

  function toggleScene(id: string) {
    setOpenScenes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const missingAssets = demoAssets.filter((a) => a.status === "missing");

  return (
    <div className="scenes-layout">
      {/* ── Left: scene list ── */}
      <div className="scenes-main">
        {demoScenes.map((scene) => {
          const isOpen = openScenes.has(scene.id);
          const sceneShots = demoShots.filter((s) => s.scene_id === scene.id);
          return (
            <div key={scene.id} className={`scene-block${isOpen ? " open" : ""}`}>
              <div
                className="scene-bar"
                onClick={() => toggleScene(scene.id)}
                style={{ cursor: "pointer" }}
              >
                <span className="scene-caret">▶</span>
                <span className="scene-name">
                  场景 {String(scene.scene_number).padStart(2, "0")} · {scene.title}
                </span>
                <span className="scene-count">{sceneShots.length} 分镜</span>
              </div>
              {isOpen && (
                <div className="scene-body">
                  {sceneShots.map((shot) => (
                    <div
                      key={shot.id}
                      className={`shot-row${selectedShot?.id === shot.id ? " selected" : ""}`}
                      onClick={() => setSelectedShot(shot)}
                      style={{ cursor: "pointer" }}
                    >
                      <div className="shot-top">
                        <span className="shot-no">镜 {String(shot.shot_number).padStart(2, "0")}</span>
                        <span className="shot-edit-hint">点击编辑 →</span>
                      </div>
                      <div className="shot-fields">
                        <span className="shot-k">景别</span>
                        <span className="shot-v">{shot.framing || "-"}</span>
                        <span className="shot-k">主体</span>
                        <span className="shot-v">{shot.subject || "-"}</span>
                        <span className="shot-k">动作</span>
                        <span className="shot-v">{shot.action || "-"}</span>
                        <span className="shot-k">氛围</span>
                        <span className="shot-v">{shot.mood || "-"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        <div className="gap-panel">
          <div className="gap-title">以下参考图缺失，建议在生成 Storyboard 前补充：</div>
          <div className="gap-subtitle">有自己的实拍图、达人照片或空间参考？配置后可直接上传。</div>
          {missingAssets.map((a) => (
            <div key={a.id} className="gap-row">
              <span className={`gap-dot ${a.priority === "required" ? "red" : "yellow"}`} />
              <span className="gap-name">{a.name}</span>
              <span className="gap-actions">
                <button className="gap-btn" disabled>AI 生成</button>
                <button className="gap-btn solid" disabled>上传参考图</button>
                <button className="gap-btn skip" disabled>跳过</button>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right: edit panel ── */}
      <aside className="scenes-aside">
        {selectedShot ? (
          <div key={selectedShot.id}>
            <div className="aside-title">编辑分镜</div>
            <div className="aside-sub">
              场景 {String(demoScenes.find((s) => s.id === selectedShot.scene_id)?.scene_number ?? 0).padStart(2, "0")} · 镜 {String(selectedShot.shot_number).padStart(2, "0")}
            </div>
            <div className="shot-form">
              <label>景别/角度</label>
              <select value={selectedShot.framing ?? ""} disabled>
                {FRAMING_OPTIONS.map((f) => (
                  <option key={f}>{f}</option>
                ))}
              </select>
              <label>画面主体</label>
              <input value={selectedShot.subject ?? ""} readOnly />
              <label>动作/内容</label>
              <input value={selectedShot.action ?? ""} readOnly />
              <label>情绪/氛围</label>
              <input value={selectedShot.mood ?? ""} readOnly />
              <div className="shot-form-actions">
                <button className="btn-s" onClick={() => setSelectedShot(null)}>关闭</button>
                <button className="btn-s solid" disabled>保存（演示不可用）</button>
              </div>
            </div>
            <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 14, lineHeight: 1.5 }}>
              演示模式下编辑不可用。配置后可在此修改分镜的所有字段。
            </p>
          </div>
        ) : (
          <div>
            <div className="aside-title">分镜编辑</div>
            <div className="aside-sub">点击左侧任意分镜卡片，在此处编辑详情。</div>
            <div className="aside-empty">
              <span className="aside-empty-icon">←</span>
              <span>选择一个分镜开始编辑</span>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
