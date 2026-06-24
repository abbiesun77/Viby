import { EmailAuthForm } from "../../../components/auth/email-auth-form";

export default function SignInPage() {
  return (
    <main className="min-h-screen bg-[#050816] text-white">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-6 py-16">
        <div className="grid w-full gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="max-w-2xl">
            <p className="text-sm font-medium tracking-[0.24em] text-cyan-300">
              BACK TO WORK
            </p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight text-white md:text-6xl">
              登录 Viby
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-300">
              回到你的导演工作流，继续整理分镜、查看剩余 Viby Credit，或在试用结束后切到自己的
              Key。
            </p>
            <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-5 text-sm leading-6 text-slate-300">
              <h2 className="text-base font-semibold text-white">登录后你会看到</h2>
              <ul className="mt-3 space-y-2">
                <li>当前试用额度和 Viby Credit 状态</li>
                <li>最近项目与继续创作入口</li>
                <li>切换到 BYOK 的设置入口</li>
              </ul>
            </div>
          </div>

          <EmailAuthForm mode="sign-in" />
        </div>
      </section>
    </main>
  );
}
