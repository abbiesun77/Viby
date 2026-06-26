import Link from "next/link";

const headline = "少抽卡，更稳地做出想要的视频";

function HeadlineChars() {
  let delay = 0.18;
  return (
    <>
      {Array.from(headline).map((char, i) => {
        const d = delay.toFixed(2);
        delay += char === "，" || char === " " || char === "," ? 0.025 : 0.045;
        return (
          <span key={i} className="hc" style={{ animationDelay: `${d}s` }}>
            {char}
          </span>
        );
      })}
    </>
  );
}

export function Hero() {
  return (
    <section className="hero" id="hero">
      <p className="kicker">AI Video Pre-Production</p>
      <h1 className="hero-headline">
        <HeadlineChars />
      </h1>
      <p className="hero-sub">
        把一句话、段落或剧本整理成分镜、角色设定和场景参考图，打包成可直接交给视频模型的素材包。
      </p>
      <div className="hero-actions">
        <Link href="/sign-up" className="btn-primary">
          免费试用，注册即得 Credit
        </Link>
        <Link href="#workflow" className="btn-text">
          了解工作流 →
        </Link>
      </div>
      <div className="hero-stats">
        <div className="stat">
          <div className="stat-n">2</div>
          <div className="stat-l">种创作入口</div>
        </div>
        <div className="stat">
          <div className="stat-n">120</div>
          <div className="stat-l">新用户 Viby Credit</div>
        </div>
        <div className="stat">
          <div className="stat-n">2</div>
          <div className="stat-l">种导出路径 · Seedance &amp; Omni</div>
        </div>
      </div>
    </section>
  );
}
