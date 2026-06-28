const optional = (value: string | undefined) => value?.trim() || undefined;

// Text and image generation can use different providers (e.g. DeepSeek for
// text, Right Code for images). Each falls back to the shared VIBY_AI_* vars
// if a dedicated one isn't set.
const sharedBaseUrl = optional(process.env.VIBY_AI_BASE_URL);
const sharedApiKey = optional(process.env.VIBY_AI_API_KEY);

export const env = {
  // text
  textBaseUrl: optional(process.env.VIBY_AI_TEXT_BASE_URL) ?? sharedBaseUrl,
  textApiKey: optional(process.env.VIBY_AI_TEXT_API_KEY) ?? sharedApiKey,
  textModel: process.env.VIBY_AI_TEXT_MODEL?.trim() || "gpt-4o",
  // image
  imageBaseUrl: optional(process.env.VIBY_AI_IMAGE_BASE_URL) ?? sharedBaseUrl,
  imageApiKey: optional(process.env.VIBY_AI_IMAGE_API_KEY) ?? sharedApiKey,
  imageModel: process.env.VIBY_AI_IMAGE_MODEL?.trim() || "gpt-image-2",
};

export function hasHostedTextAi() {
  return Boolean(env.textBaseUrl && env.textApiKey);
}

export function hasHostedImageAi() {
  return Boolean(env.imageBaseUrl && env.imageApiKey);
}
