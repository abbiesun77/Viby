import { CreditBalanceCard } from "../../../components/dashboard/credit-balance-card";
import { ProjectCreateCard } from "../../../components/dashboard/project-create-card";

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
              欢迎来到 Viby
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              先整理故事、分场和参考素材，再去生成更稳定的视频。
            </p>
          </div>
          <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">
            当前模式：Viby AI 试用
          </div>
        </header>

        <section className="mt-8 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <CreditBalanceCard points={120} />
          <ProjectCreateCard />
        </section>
      </div>
    </main>
  );
}
