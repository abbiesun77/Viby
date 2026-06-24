import Link from "next/link";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.14),_transparent_42%),linear-gradient(180deg,#050816_0%,#050816_100%)]">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-24">
        <div className="max-w-2xl">
          <p className="text-sm font-medium tracking-[0.22em] text-cyan-300">
            VIBY
          </p>
          <h1 className="mt-4 text-5xl font-semibold leading-tight text-white md:text-7xl">
            少抽卡，更稳地做出想要的视频
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300 md:text-xl">
            把一句话、段落或剧本整理成分镜、角色设定、场景定调图和可直接交给视频模型的素材包。
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/sign-up"
              className="inline-flex items-center rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-offset-2 focus:ring-offset-[#050816]"
            >
              免费试用
            </Link>
            <Link
              href="/sign-in"
              className="inline-flex items-center rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-offset-2 focus:ring-offset-[#050816]"
            >
              登录
            </Link>
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.22)]">
          <div className="grid gap-4">
            <div className="rounded-2xl border border-white/10 bg-[#0b1220] p-4">
              <p className="text-xs font-medium uppercase tracking-[0.22em] text-cyan-300">
                输入
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-200">
                一个想法，一段说明，或者一份完整剧本。
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#0b1220] p-4">
              <p className="text-xs font-medium uppercase tracking-[0.22em] text-cyan-300">
                输出
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-200">
                角色、场景、镜头和参考素材，按创作顺序整理好。
              </p>
            </div>
            <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-4">
              <p className="text-xs font-medium uppercase tracking-[0.22em] text-cyan-200">
                试用
              </p>
              <p className="mt-2 text-sm leading-6 text-cyan-50">
                新用户会先拿到 Viby Credit，先跑通流程再决定是否接入自己的 Key。
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
