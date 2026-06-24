const entryOptions = ["一句话脑暴", "段落转分镜", "导入剧本"] as const;

type ProjectCreateCardProps = {
  title?: string;
  description?: string;
};

export function ProjectCreateCard({
  title = "开始一个新项目",
  description = "先从最轻的入口进去，系统会帮你把想法收紧成可执行的创作起点。",
}: ProjectCreateCardProps) {
  return (
    <section className="rounded-[24px] border border-white/10 bg-[#0a1020] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.25)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-cyan-200">新建项目</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">{title}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
            {description}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-3">
        {entryOptions.map((option) => (
          <button
            key={option}
            type="button"
            className="flex min-h-28 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 py-5 text-center text-lg font-semibold text-white transition hover:border-cyan-300/40 hover:bg-cyan-300/10 focus:outline-none focus:ring-2 focus:ring-cyan-300"
          >
            {option}
          </button>
        ))}
      </div>
    </section>
  );
}
