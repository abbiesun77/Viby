import { env } from "../env";

export type AiMode = "viby_ai" | "byok";

export interface AiConfig {
  mode: AiMode;
  // Text provider
  byokBaseUrl?: string;
  byokApiKey?: string;
  byokTextModel?: string;
  // Image provider (separate; falls back to text config if not set)
  byokImageBaseUrl?: string;
  byokImageApiKey?: string;
  byokImageModel?: string;
}

interface ResolvedEndpoint {
  baseUrl: string;
  apiKey: string;
}

// BYOK: text and image providers are now configured separately.
// Image falls back to text config when image-specific config is absent.
function resolveTextEndpoint(config: AiConfig): ResolvedEndpoint {
  if (config.mode === "byok") {
    if (!config.byokBaseUrl || !config.byokApiKey)
      throw new Error("BYOK 模式需要填写文本 AI 的 Base URL 和 API Key。");
    return { baseUrl: stripTrailingSlash(config.byokBaseUrl), apiKey: config.byokApiKey };
  }
  if (!env.textBaseUrl || !env.textApiKey)
    throw new Error("文本 AI 线路尚未配置，请在设置中切换到自己的 API Key。");
  return { baseUrl: stripTrailingSlash(env.textBaseUrl), apiKey: env.textApiKey };
}

function resolveImageEndpoint(config: AiConfig): ResolvedEndpoint {
  if (config.mode === "byok") {
    const url = config.byokImageBaseUrl ?? config.byokBaseUrl;
    const key = config.byokImageApiKey ?? config.byokApiKey;
    if (!url || !key)
      throw new Error("BYOK 模式需要填写图像 AI 的 Base URL 和 API Key。");
    return { baseUrl: stripTrailingSlash(url), apiKey: key };
  }
  if (!env.imageBaseUrl || !env.imageApiKey)
    throw new Error("图像 AI 线路尚未配置，请在设置中切换到自己的 API Key。");
  return { baseUrl: stripTrailingSlash(env.imageBaseUrl), apiKey: env.imageApiKey };
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
  const { baseUrl, apiKey } = resolveTextEndpoint(config);
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: env.textModel,
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
  const { baseUrl, apiKey } = resolveImageEndpoint(config);
  const res = await fetch(`${baseUrl}/images/generations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: env.imageModel,
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

/**
 * Image generation with optional reference image(s) for img2img consistency.
 * Uses /images/generations with the `image` array parameter supported by
 * right.codes and gpt-image-2 compatible endpoints.
 */
export async function generateImageWithRef(
  prompt: string,
  config: AiConfig,
  referenceUrl?: string | null
): Promise<string> {
  const { baseUrl, apiKey } = resolveImageEndpoint(config);
  const body: Record<string, unknown> = {
    model: env.imageModel,
    prompt,
    n: 1,
    size: IMAGE_SIZES["16:9"],
    response_format: "url",
  };
  if (referenceUrl) {
    body.image = [referenceUrl];
  }

  const res = await fetch(`${baseUrl}/images/generations`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(`图片生成失败 (${res.status})`);

  const data = await res.json();
  const url = data?.data?.[0]?.url;
  const b64 = data?.data?.[0]?.b64_json;
  if (typeof url === "string") return url;
  if (typeof b64 === "string") return `data:image/png;base64,${b64}`;
  throw new Error("图片生成返回内容为空。");
}
