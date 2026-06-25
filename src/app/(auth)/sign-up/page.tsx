import Link from "next/link";
import { EmailAuthForm } from "../../../components/auth/email-auth-form";

export default function SignUpPage() {
  return (
    <>
      <nav className="auth-nav">
        <Link href="/" className="auth-nav-logo">Viby</Link>
        <Link href="/" className="auth-nav-back">← 返回首页</Link>
      </nav>
      <div className="auth-shell">
        <div className="auth-brand">
          <p className="brand-kicker">AI Video Pre-Production</p>
          <h1 className="brand-head">把想法变成<br />可投喂的素材包</h1>
          <p className="brand-sub">
            注册后立即开始：从一句话或剧本出发，生成分镜、角色设定和场景参考图。
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
            <h1 className="form-title">创建 Viby 账号</h1>
            <p className="form-desc">
              注册后可获得 120 Viby Credit，先体验完整流程再决定是否接入自己的 Key。
            </p>
            <EmailAuthForm mode="sign-up" />
          </div>
        </div>
      </div>
    </>
  );
}
