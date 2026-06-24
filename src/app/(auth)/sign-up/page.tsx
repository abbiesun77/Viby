import { EmailAuthForm } from "../../../components/auth/email-auth-form";

export default function SignUpPage() {
  return (
    <main className="min-h-screen bg-[#050816] text-white">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-6 py-16">
        <div className="grid w-full gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="max-w-2xl">
            <p className="text-sm font-medium tracking-[0.24em] text-cyan-300">
              START WITH TRIAL
            </p>
            <h2 className="mt-4 text-4xl font-semibold leading-tight text-white md:text-6xl">
              创建 Viby 账号
            </h2>
            <p className="mt-6 text-lg leading-8 text-slate-300">
              先用 Viby Credit 跑通从想法到分镜、参考图和素材包的完整流程，再决定什么时候切到
              BYOK。
            </p>
            <div className="mt-8 grid gap-4 text-sm leading-6 text-slate-300 md:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <h3 className="text-base font-semibold text-white">
                  注册后可获得 Viby Credit
                </h3>
                <p className="mt-2">
                  先体验试用额度，不需要一上来就准备 API Key 或代理配置。
                </p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <h3 className="text-base font-semibold text-white">
                  需要邮箱验证
                </h3>
                <p className="mt-2">
                  我们会发一封验证邮件到你的邮箱，验证完成后再进入工作台。
                </p>
              </div>
            </div>
          </div>

          <EmailAuthForm mode="sign-up" />
        </div>
      </section>
    </main>
  );
}
