import Link from "next/link";

export function TrialSection() {
  return (
    <section className="trial" aria-labelledby="trial-head">
      <div>
        <h2 className="trial-head" id="trial-head" data-reveal>
          先用，再决定<br />要不要接自己的 Key
        </h2>
        <p className="trial-sub" data-reveal data-d="1">
          注册后立即获得 Viby Credit，可以完整体验从故事大纲到分镜和参考图的全流程。Credit
          用完之后，再切换到你自己的 OpenAI 兼容接口继续创作。
        </p>
      </div>
      <div data-reveal>
        <div className="credit-box">
          <span className="credit-n">120</span>
          <span className="credit-u">Credit</span>
          <div className="credit-d">
            新用户注册即得 · 可用于文案生成和参考图生成
            <br />
            用完后接入自己的 API Key 继续创作
          </div>
        </div>
        <div className="trial-cta-row">
          <Link href="/sign-up" className="btn-accent">免费注册</Link>
          <Link href="/sign-in" className="btn-ghost">已有账号 — 登录</Link>
        </div>
      </div>
    </section>
  );
}
