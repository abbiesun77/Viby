"use client";

import { useState } from "react";
import { demoStoryboards } from "../../lib/demo-data";

const GRID_OPTIONS = [6, 9, 12, 16, 18];

/**
 * Demo-mode storyboard workspace with full interactivity:
 * - Scene blocks can expand/collapse
 * - Prompt edit panel toggles open/closed
 * - Right-side prompt overview sidebar
 */
export function DemoStoryboardWorkspace() {
  const [gridSize] = useState(16);
  const [ratio, setRatio] = useState<"16:9" | "9:16">("16:9");
  const [openScenes, setOpenScenes] = useState<Set<string>>(
    new Set([demoStoryboards[0]?.id])
  );

  function toggleScene(id: string) {
    setOpenScenes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <>
      <div className="board-layout">
        {/* ── Left: options + scene frames ── */}
        <div className="board-main">
          <div className="board-options">
            <div className="bo-row">
              <span className="bo-label">生成格式</span>
              {GRID_OPTIONS.map((g) => (
                <button key={g} className={`bo-chip${gridSize === g ? " sel" : ""}`} disabled>{g}格</button>
              ))}
            </div>
            <div className="bo-row">
              <span className="bo-label">画面比例</span>
              <button className={`bo-chip${ratio === "16:9" ? " sel" : ""}`} onClick={() => setRatio("16:9")} disabled>横版 16:9</button>
              <button className={`bo-chip${ratio === "9:16" ? " sel" : ""}`} onClick={() => setRatio("9:16")} disabled>竖版 9:16</button>
            </div>
            <div className="board-demo-hint">
              演示模式下生成不可用。配置 Supabase 和 AI 接口后可在此生成 Storyboard。
            </div>
          </div>

          {demoStoryboards.map((sb) => {
            const isOpen = openScenes.has(sb.id);
            return (
              <div key={sb.id} className={`board-scene${isOpen ? " open" : ""}`}>
                <div
                  className="board-scene-bar"
                  onClick={() => toggleScene(sb.id)}
                  style={{ cursor: "pointer" }}
                >
                  <span className="board-scene-caret">▶</span>
                  <span className="board-scene-head">
                    场景 {String(sb.scene_number).padStart(2, "0")} · {sb.title}
                  </span>
                </div>
                {isOpen && (
                  <>
                    <div className="board-rule" />
                    <div className={`board-frame${ratio === "9:16" ? " vertical" : ""}`}>
                      <span className="board-placeholder">未生成</span>
                    </div>
                    <BoardSceneActions prompt={sb.prompt} />
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Right: prompt overview sidebar ── */}
        <aside className="board-aside">
          <div className="aside-title">提示词总览</div>
          <div className="aside-sub">
            以下是每个场景 Storyboard 的生成提示词。配置后可在此快速预览和批量编辑。
          </div>
          <div className="prompt-list">
            {demoStoryboards.map((sb) => (
              <div key={sb.id} className="prompt-card">
                <div className="prompt-card-head">
                  场景 {String(sb.scene_number).padStart(2, "0")} · {sb.title}
                </div>
                <p className="prompt-card-body">{sb.prompt}</p>
              </div>
            ))}
          </div>
          <div className="board-aside-actions">
            <button className="btn-s" disabled>批量编辑提示词</button>
            <button className="btn-s" disabled>从模板导入</button>
          </div>
        </aside>
      </div>

      <div className="action-bar">
        <div className="ab-left">
          <a className="btn-g" href="/app/demo/scenes">← 返回场景</a>
        </div>
        <a className="btn-p" href="/app/projects/demo/export">前往导出 →</a>
      </div>
    </>
  );
}

function BoardSceneActions({ prompt }: { prompt: string | null }) {
  const [showPrompt, setShowPrompt] = useState(false);

  return (
    <>
      <div className="board-actions">
        <button className="board-btn" onClick={() => setShowPrompt((s) => !s)}>
          {showPrompt ? "收起提示词" : "查看/编辑提示词"}
        </button>
        <button className="board-btn" disabled>重新生成</button>
        <button className="board-btn" disabled>下载此图</button>
      </div>
      {showPrompt && prompt && (
        <div className="prompt-edit">
          <textarea value={prompt} readOnly />
          <div className="prompt-edit-actions">
            <button className="btn-s" onClick={() => setShowPrompt(false)}>收起</button>
            <button className="btn-s solid" disabled>用此提示词重新生成</button>
          </div>
        </div>
      )}
    </>
  );
}
