type Step = "script" | "scenes" | "storyboard";

const STATE_RANK: Record<string, number> = {
  onboarding: 0,
  script: 1,
  scenes: 2,
  storyboard: 3,
  done: 4,
};

const TABS: { key: Step; label: string }[] = [
  { key: "script", label: "剧本" },
  { key: "scenes", label: "场景 & 分镜" },
  { key: "storyboard", label: "Storyboard" },
];

const TAB_RANK: Record<Step, number> = { script: 1, scenes: 2, storyboard: 3 };

/**
 * Pure progress indicator. Tabs are NOT clickable — navigation happens
 * exclusively through the action bars at the bottom of each step page.
 * This avoids full-page refreshes from <a>/<Link> and keeps the workflow
 * linear (forward via "confirm" buttons, back via "return" buttons).
 */
export function TabNav({
  workflowState,
  current,
}: {
  projectId: string;
  workflowState: string;
  current: Step;
}) {
  const reached = STATE_RANK[workflowState] ?? 0;

  return (
    <div className="tabbar" role="tablist" aria-readonly="true">
      {TABS.map((tab) => {
        const unlocked = reached >= TAB_RANK[tab.key];
        const isCurrent = tab.key === current;
        const done = reached > TAB_RANK[tab.key];
        const mark = done ? "✓" : isCurrent ? "●" : "○";
        const markCls = `tab-mark${done ? " done" : isCurrent ? " cur" : ""}`;

        return (
          <div
            key={tab.key}
            className={`tab${isCurrent ? " active" : ""}`}
            role="tab"
            aria-selected={isCurrent}
            aria-disabled={!unlocked}
          >
            <span className={markCls}>{mark}</span> {tab.label}
          </div>
        );
      })}
    </div>
  );
}
