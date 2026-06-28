"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { createClient } from "../../lib/supabase/browser";

type EmailAuthFormProps = {
  mode: "sign-in" | "sign-up";
};

type FormState = {
  error: string | null;
  success: string | null;
  submitting: boolean;
};

const INITIAL_STATE: FormState = {
  error: null,
  success: null,
  submitting: false,
};

const SUPABASE_DISABLED_MESSAGE =
  "本地还没有配置 Supabase，所以这里只展示界面，不会真的发送注册或登录请求。";

export function EmailAuthForm({ mode }: EmailAuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formState, setFormState] = useState<FormState>(INITIAL_STATE);

  const isSignUp = mode === "sign-up";
  const buttonLabel = isSignUp ? "创建账号" : "登录";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormState({
      error: null,
      success: null,
      submitting: true,
    });

    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password) {
      setFormState({
        error: "请填写邮箱和密码。",
        success: null,
        submitting: false,
      });
      return;
    }

    const supabaseMissing =
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseMissing && process.env.NODE_ENV !== "test") {
      setFormState({
        error: null,
        success: `${SUPABASE_DISABLED_MESSAGE} 正在带你进入演示工作台。`,
        submitting: false,
      });
      window.setTimeout(() => {
        router.push("/app");
      }, 700);
      return;
    }
    try {
      const supabase = createClient();

      const { error } = isSignUp
        ? await supabase.auth.signUp({
            email: trimmedEmail,
            password,
          })
        : await supabase.auth.signInWithPassword({
            email: trimmedEmail,
            password,
          });

      if (error) {
        setFormState({
          error: error.message,
          success: null,
          submitting: false,
        });
        return;
      }

      setFormState({
        error: null,
        success: isSignUp
          ? "注册成功，正在进入 Viby…"
          : "登录成功，现在可以继续使用 Viby。",
        submitting: false,
      });

      if (process.env.NODE_ENV !== "test") {
        window.setTimeout(() => {
          router.push("/app");
        }, 700);
      }
    } catch (error) {
      setFormState({
        error: error instanceof Error ? error.message : "提交失败，请稍后再试。",
        success: null,
        submitting: false,
      });
    }
  }

  return (
    <div className="auth-form-inner">
      <form onSubmit={handleSubmit}>
        <label className="auth-field">
          邮箱
          <input
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
          />
        </label>

        <label className="auth-field">
          密码
          <input
            type="password"
            name="password"
            autoComplete={isSignUp ? "new-password" : "current-password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder={isSignUp ? "至少 8 位" : "输入你的密码"}
          />
        </label>

        <button type="submit" disabled={formState.submitting} className="btn-submit">
          {formState.submitting ? (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <span style={{
                width: 14, height: 14,
                border: "1.5px solid rgba(255,255,255,0.3)",
                borderTopColor: "#fff",
                borderRadius: "50%",
                display: "inline-block",
                animation: "viby-spin 0.6s linear infinite",
              }} />
              {buttonLabel}中…
            </span>
          ) : buttonLabel}
        </button>
      </form>

      {(formState.error || formState.success) && (
        <p className={`auth-msg ${formState.error ? "err" : "ok"}`}>
          {formState.error ?? formState.success}
        </p>
      )}

      <p className="form-alt">
        {isSignUp ? "已有账号？" : "没有账号？"}
        <Link href={isSignUp ? "/sign-in" : "/sign-up"}>
          {isSignUp ? " 登录 →" : " 免费注册 →"}
        </Link>
      </p>

      <style>{`@keyframes viby-spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
