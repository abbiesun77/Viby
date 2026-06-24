type ProjectPageProps = {
  params: {
    projectId: string;
  };
};

const sampleScenes = [
  {
    id: "scene_1",
    title: "便利店夜班的异常重逢",
    summary: "先把角色状态和便利店氛围立住，再进入真正的冲突。",
  },
  {
    id: "scene_2",
    title: "来自未来的任务交接",
    summary: "用更明确的任务和倒计时，把后续镜头推进力撑起来。",
  },
];

export default function ProjectOverviewPage({ params }: ProjectPageProps) {
  return (
    <main className="min-h-screen bg-[#050816] text-white">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <header className="border-b border-white/10 pb-6">
          <p className="text-sm font-medium tracking-[0.24em] text-cyan-300">
            PROJECT OVERVIEW
          </p>
          <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">
                便利店宇航员
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                先稳定角色、场景和叙事目标，再往镜头清单和参考素材继续推进。
              </p>
            </div>
            <div className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-100">
              项目 ID：{params.projectId}
            </div>
          </div>
        </header>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-lg border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold">创作简报</h2>
            <dl className="mt-5 grid gap-4 sm:grid-cols-3">
              <div>
                <dt className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  类型
                </dt>
                <dd className="mt-2 text-sm text-slate-100">科幻剧情</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  气质
                </dt>
                <dd className="mt-2 text-sm text-slate-100">
                  克制、轻微荒诞、电影感
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  当前阶段
                </dt>
                <dd className="mt-2 text-sm text-slate-100">简报已生成</dd>
              </div>
            </dl>
            <p className="mt-5 rounded-lg border border-white/10 bg-[#0b1228] p-4 text-sm leading-6 text-slate-200">
              目标：先稳定角色和便利店场景，再展开镜头。
            </p>
          </div>

          <aside className="rounded-lg border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold">下一步建议</h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-200">
              <li>1. 生成分场，把叙事节奏先定下来。</li>
              <li>2. 标出缺失素材，避免后面反复补图。</li>
              <li>3. 进入镜头清单前先确认角色和场景定调。</li>
            </ul>
          </aside>
        </section>

        <section className="mt-8 rounded-lg border border-white/10 bg-white/5 p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">分场基础</h2>
              <p className="mt-2 text-sm text-slate-300">
                这是场景生成的最小落点，后续可以接镜头清单和素材检查。
              </p>
            </div>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200">
              {sampleScenes.length} 个场景
            </span>
          </div>
          <div className="mt-5 grid gap-4">
            {sampleScenes.map((scene, index) => (
              <article
                key={scene.id}
                className="rounded-lg border border-white/10 bg-[#0b1228] p-4"
              >
                <p className="text-xs uppercase tracking-[0.18em] text-cyan-300">
                  场景 {index + 1}
                </p>
                <h3 className="mt-2 text-lg font-medium text-white">
                  {scene.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  {scene.summary}
                </p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
