import Link from "next/link";
import { EmailAuthForm } from "../../../components/auth/email-auth-form";

export default function SignInPage() {
  return (
    <>
      <nav className="auth-nav">
        <Link href="/" className="auth-nav-logo">Viby</Link>
        <Link href="/" className="auth-nav-back">← 返回首页</Link>
      </nav>
      <div className="auth-shell">
        <div className="auth-brand">
          <p className="brand-kicker">AI Video Pre-Production</p>
          <h1 className="brand-head">回到你的<br />导演工作台</h1>
          <p className="brand-sub">
            继续整理分镜、查看剩余 Viby Credit，或在试用结束后切换到自己的 Key。
          </p>
          <div className="credit-callout">
            <span className="credit-callout-n">120</span>
            <span className="credit-callout-u">Credit</span>
            <div className="credit-callout-d">
              新用户注册即得 · 无需提前配置 API Key
              <br />
              可用于剧本、分镜和参考图生成
            </div>
          </div>
        </div>

        <div className="auth-form-panel">
          <div className="auth-form-inner">
            <h1 className="form-title">登录 Viby</h1>
            <p className="form-desc">回到你的导演工作流，继续创作。</p>
            <EmailAuthForm mode="sign-in" />
          </div>
        </div>
      </div>
    </>
  );
}
