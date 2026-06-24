type VerifyEmailProps = {
  confirmUrl: string;
  productName?: string;
};

export function VerifyEmail({
  confirmUrl,
  productName = "Viby",
}: VerifyEmailProps) {
  return (
    <div
      style={{
        margin: "0",
        padding: "32px 20px",
        backgroundColor: "#050816",
        color: "#f8fafc",
        fontFamily:
          'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: "560px",
          margin: "0 auto",
          borderRadius: "24px",
          border: "1px solid rgba(255,255,255,0.12)",
          backgroundColor: "rgba(15,23,42,0.88)",
          padding: "32px",
        }}
      >
        <p
          style={{
            margin: "0 0 12px",
            color: "#67e8f9",
            fontSize: "12px",
            fontWeight: 600,
            letterSpacing: "0.24em",
          }}
        >
          VERIFY YOUR EMAIL
        </p>
        <h1
          style={{
            margin: "0",
            fontSize: "28px",
            lineHeight: "36px",
          }}
        >
          完成邮箱验证，开始使用 {productName}
        </h1>
        <p
          style={{
            margin: "16px 0 0",
            fontSize: "15px",
            lineHeight: "26px",
            color: "#cbd5e1",
          }}
        >
          点击下方按钮确认你的邮箱。验证完成后，你就可以领取试用阶段的 Viby Credit，并继续进入
          分镜与素材整理流程。
        </p>
        <a
          href={confirmUrl}
          style={{
            display: "inline-block",
            marginTop: "24px",
            borderRadius: "999px",
            backgroundColor: "#22d3ee",
            padding: "12px 22px",
            color: "#020617",
            fontSize: "14px",
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          验证邮箱
        </a>
        <p
          style={{
            margin: "24px 0 0",
            fontSize: "13px",
            lineHeight: "22px",
            color: "#94a3b8",
          }}
        >
          如果按钮无法打开，请复制这个链接到浏览器：
          <br />
          <span style={{ color: "#e2e8f0", wordBreak: "break-all" }}>
            {confirmUrl}
          </span>
        </p>
      </div>
    </div>
  );
}

export default VerifyEmail;
