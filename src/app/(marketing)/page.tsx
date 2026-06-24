import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#050816] text-white">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-6 py-16">
        <div className="max-w-3xl">
          <h1 className="text-5xl font-semibold leading-tight text-white md:text-7xl">
            Viby
          </h1>
          <p className="mt-4 text-sm font-medium tracking-[0.24em] text-cyan-300">
            少抽卡，更稳地做出想要的视频
          </p>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300 md:text-xl">
            把一句话、段落或剧本整理成分镜、角色设定、场景定调图和可直接交给视频模型的素材包。
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
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
      </section>
    </main>
  );
}
