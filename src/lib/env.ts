const optional = (value: string | undefined) => value?.trim() || undefined;

export const env = {
  vibyAiBaseUrl: optional(process.env.VIBY_AI_BASE_URL),
  vibyAiApiKey: optional(process.env.VIBY_AI_API_KEY),
  vibyAiTextModel: process.env.VIBY_AI_TEXT_MODEL?.trim() || "gpt-4o",
  vibyAiImageModel: process.env.VIBY_AI_IMAGE_MODEL?.trim() || "gpt-image-2",
};

export function hasHostedVibyAi() {
  return Boolean(env.vibyAiBaseUrl && env.vibyAiApiKey);
}
