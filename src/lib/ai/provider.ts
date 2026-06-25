import { hasHostedVibyAi } from "../env";

export type AiMode = "viby_ai" | "byok";

export type GenerateStructuredTextInput = {
  mode: AiMode;
  prompt: string;
  byokBaseUrl?: string;
  byokApiKey?: string;
};

export async function generateStructuredText(input: GenerateStructuredTextInput) {
  if (input.mode === "viby_ai") {
    if (!hasHostedVibyAi()) {
      return {
        content: "Viby AI 当前还没有接入可用的托管线路，请先使用试用界面体验流程。",
        provider: "viby_ai" as const,
      };
    }

    return {
      content: "hosted-viby-result",
      provider: "viby_ai" as const,
    };
  }

  if (!input.byokBaseUrl || !input.byokApiKey) {
    throw new Error("BYOK 模式需要填写 Base URL 和 API Key。");
  }

  return {
    content: "byok-result",
    provider: "byok" as const,
  };
}
