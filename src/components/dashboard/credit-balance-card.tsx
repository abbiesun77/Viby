type CreditBalanceCardProps = {
  points: number;
};

export function CreditBalanceCard({
  points,
}: CreditBalanceCardProps) {
  return (
    <section className="rounded-[24px] border border-white/10 bg-white/5 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.25)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-cyan-200">Viby Credit</p>
          <h2 className="mt-2 text-4xl font-semibold tracking-tight text-white">
            {points}
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            先用试用额度跑通从想法到分镜、参考素材和素材包的流程，之后再切到自己的 Key 继续。
          </p>
        </div>
      </div>
    </section>
  );
}
