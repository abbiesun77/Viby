type CreditBalanceCardProps = {
  balance: number;
  modeLabel: string;
};

export function CreditBalanceCard({
  balance,
  modeLabel,
}: CreditBalanceCardProps) {
  return (
    <section className="rounded-[24px] border border-white/10 bg-white/5 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.25)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-cyan-200">Viby Credit</p>
          <h2 className="mt-2 text-4xl font-semibold tracking-tight text-white">
            {balance}
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            当前可用于试用流程，优先支持脑暴、分镜和素材准备。
          </p>
        </div>
        <span className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-xs font-medium text-cyan-100">
          {modeLabel}
        </span>
      </div>
    </section>
  );
}
