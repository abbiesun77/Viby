"use client";

import Link from "next/link";
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

export function EmailAuthForm({ mode }: EmailAuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formState, setFormState] = useState<FormState>(INITIAL_STATE);

  const isSignUp = mode === "sign-up";
  const buttonLabel = isSignUp ? "创建账号" : "登录";
  const helperCopy = isSignUp
    ? "完成注册后即可开始试用额度，先体验 Viby AI，再决定是否接入你自己的 Key。"
    : "继续你的项目，查看剩余 Viby Credit，或在试用结束后切换到自己的 Key。";

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
    try {
      const supabase = createClient();

      const { error } = isSignUp
        ? await supabase.auth.signUp({
            email: trimmedEmail,
            password,
            options: {
              emailRedirectTo: `${window.location.origin}/verify`,
            },
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
          ? "验证邮件已发送，请前往邮箱完成验证后再进入 Viby。"
          : "登录成功，现在可以继续使用 Viby。",
        submitting: false,
      });
    } catch (error) {
      setFormState({
        error: error instanceof Error ? error.message : "提交失败，请稍后再试。",
        success: null,
        submitting: false,
      });
    }
  }

  return (
    <div className="w-full max-w-md rounded-[28px] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-cyan-950/30 backdrop-blur">
      <div className="space-y-3">
        <p className="text-sm font-medium tracking-[0.2em] text-cyan-300">
          VIBY AUTH
        </p>
        <p className="text-sm leading-6 text-slate-300">{helperCopy}</p>
      </div>

      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        <label className="block text-sm font-medium text-slate-100">
          邮箱
          <input
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-base text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/30"
            placeholder="you@example.com"
          />
        </label>

        <label className="block text-sm font-medium text-slate-100">
          密码
          <input
            type="password"
            name="password"
            autoComplete={isSignUp ? "new-password" : "current-password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-base text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/30"
            placeholder={isSignUp ? "至少 6 位密码" : "输入你的密码"}
          />
        </label>

        <button
          type="submit"
          disabled={formState.submitting}
          className="inline-flex w-full items-center justify-center rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-offset-2 focus:ring-offset-[#050816] disabled:cursor-not-allowed disabled:bg-cyan-200"
        >
          {formState.submitting ? "提交中..." : buttonLabel}
        </button>
      </form>

      {(formState.error || formState.success) && (
        <p
          className={`mt-4 text-sm leading-6 ${
            formState.error ? "text-rose-300" : "text-emerald-300"
          }`}
        >
          {formState.error ?? formState.success}
        </p>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-400">
        <span>{isSignUp ? "已经有账号？" : "第一次来？"}</span>
        <Link
          href={isSignUp ? "/sign-in" : "/sign-up"}
          className="font-medium text-cyan-300 transition hover:text-cyan-200"
        >
          {isSignUp ? "去登录" : "创建新账号"}
        </Link>
      </div>
    </div>
  );
}
