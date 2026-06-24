const steps = ["一句话脑暴", "段落转分镜", "导入剧本", "整理成可执行素材包"];

export function WorkflowStrip() {
  return (
    <section className="border-b border-white/10 bg-[#070b18]">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="grid gap-3 md:grid-cols-4">
          {steps.map((step, index) => (
            <div
              key={step}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4"
            >
              <p className="text-xs font-medium tracking-[0.2em] text-cyan-300">
                0{index + 1}
              </p>
              <p className="mt-2 text-sm font-semibold text-white">{step}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
