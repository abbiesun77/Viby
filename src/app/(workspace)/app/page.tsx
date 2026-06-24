import { CreditBalanceCard } from "../../../components/dashboard/credit-balance-card";
import { ProjectCreateCard } from "../../../components/dashboard/project-create-card";

const recentProjects = [
  {
    name: "雨夜便利店",
    state: "正在整理镜头",
    updatedAt: "今天 09:20",
  },
  {
    name: "春日品牌短片",
    state: "等待补充参考图",
    updatedAt: "昨天 18:45",
  },
];

export default function AppHomePage() {
  return (
    <main className="min-h-screen bg-[#050816] text-white">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <header className="flex flex-col gap-4 border-b border-white/10 pb-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium tracking-[0.24em] text-cyan-300">
              VIBY WORKSPACE
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">
              先从一个清楚的起点开始
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              先补齐 brief，再往分镜和素材包走，整套流程会更稳。
            </p>
          </div>
          <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">
            当前模式：Viby AI 试用
          </div>
        </header>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.35fr]">
          <CreditBalanceCard balance={120} modeLabel="试用中" />
          <div className="rounded-[24px] border border-white/10 bg-white/5 p-6">
            <p className="text-sm font-medium text-cyan-200">最近项目</p>
            <div className="mt-4 grid gap-3">
              {recentProjects.map((project) => (
                <article
                  key={project.name}
                  className="rounded-2xl border border-white/10 bg-[#0a1020] p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-base font-semibold text-white">
                        {project.name}
                      </h2>
                      <p className="mt-1 text-sm text-slate-300">
                        {project.state}
                      </p>
                    </div>
                    <span className="text-xs text-slate-400">
                      {project.updatedAt}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <div className="mt-6">
          <ProjectCreateCard />
        </div>
      </div>
    </main>
  );
}
