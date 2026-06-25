import { env } from "../env";

export type AiMode = "viby_ai" | "byok";

export interface AiConfig {
  mode: AiMode;
  byokBaseUrl?: string;
  byokApiKey?: string;
}

interface ResolvedEndpoint {
  baseUrl: string;
  apiKey: string;
}

function resolveEndpoint(config: AiConfig): ResolvedEndpoint {
  if (config.mode === "byok") {
    if (!config.byokBaseUrl || !config.byokApiKey) {
      throw new Error("BYOK 模式需要填写 Base URL 和 API Key。");
    }
    return { baseUrl: stripTrailingSlash(config.byokBaseUrl), apiKey: config.byokApiKey };
  }

  if (!env.vibyAiBaseUrl || !env.vibyAiApiKey) {
    throw new Error("Viby AI 托管线路尚未配置，请在设置中切换到自己的 API Key。");
  }
  return { baseUrl: stripTrailingSlash(env.vibyAiBaseUrl), apiKey: env.vibyAiApiKey };
}

function stripTrailingSlash(url: string) {
  return url.replace(/\/+$/, "");
}

/** Image size strings for the OpenAI-compatible images endpoint. */
const IMAGE_SIZES = {
  "16:9": "1792x1024",
  "9:16": "1024x1792",
} as const;

export type AspectRatio = keyof typeof IMAGE_SIZES;

export async function generateText(prompt: string, config: AiConfig): Promise<string> {
  const { baseUrl, apiKey } = resolveEndpoint(config);
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: env.vibyAiTextModel,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    throw new Error(`文字生成失败 (${res.status})`);
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== "string") {
    throw new Error("文字生成返回内容为空。");
  }
  return content;
}

export async function generateImage(
  prompt: string,
  config: AiConfig,
  aspectRatio: AspectRatio = "16:9"
): Promise<string> {
  const { baseUrl, apiKey } = resolveEndpoint(config);
  const res = await fetch(`${baseUrl}/images/generations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: env.vibyAiImageModel,
      prompt,
      n: 1,
      size: IMAGE_SIZES[aspectRatio],
    }),
  });

  if (!res.ok) {
    throw new Error(`图片生成失败 (${res.status})`);
  }

  const data = await res.json();
  const url = data?.data?.[0]?.url;
  const b64 = data?.data?.[0]?.b64_json;
  if (typeof url === "string") return url;
  if (typeof b64 === "string") return `data:image/png;base64,${b64}`;
  throw new Error("图片生成返回内容为空。");
}
