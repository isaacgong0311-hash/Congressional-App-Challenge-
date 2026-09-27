export const DEFAULT_GROQ_VISION_MODEL = "qwen/qwen3.8-27b";
export const DEFAULT_GROQ_TEXT_MODEL = "openai/gpt-oss-20b";

export const ALLOWED_GROQ_VISION_MODELS = [
  DEFAULT_GROQ_VISION_MODEL,
] as const;

export const ALLOWED_GROQ_TEXT_MODELS = [
  DEFAULT_GROQ_TEXT_MODEL,
] as const;

export type GroqVisionModel = (typeof ALLOWED_GROQ_VISION_MODELS)[number];
export type GroqTextModel = (typeof ALLOWED_GROQ_TEXT_MODELS)[number];
export type AiModelRole = "vision" | "text";

export type AiConfiguration = {
  apiKeyAvailable: boolean;
  visionModel: GroqVisionModel | null;
  textModel: GroqTextModel | null;
  errors: string[];
};

type Environment = Record<string, string | undefined>;

function allowlistedModel<T extends string>(
  configured: string | undefined,
  fallback: T,
  allowed: readonly T[],
  variableName: string,
  errors: string[],
): T | null {
  const value = configured?.trim() || fallback;
  if ((allowed as readonly string[]).includes(value)) return value as T;
  errors.push(`${variableName} is not an allowed model.`);
  return null;
}

export function resolveAiConfiguration(
  environment: Environment = process.env,
): AiConfiguration {
  const errors: string[] = [];
  const visionModel = allowlistedModel(
    environment.GROQ_VISION_MODEL,
    DEFAULT_GROQ_VISION_MODEL,
    ALLOWED_GROQ_VISION_MODELS,
    "GROQ_VISION_MODEL",
    errors,
  );
  const textModel = allowlistedModel(
    environment.GROQ_TEXT_MODEL,
    DEFAULT_GROQ_TEXT_MODEL,
    ALLOWED_GROQ_TEXT_MODELS,
    "GROQ_TEXT_MODEL",
    errors,
  );

  return {
    apiKeyAvailable: Boolean(environment.GROQ_API_KEY?.trim()),
    visionModel,
    textModel,
    errors,
  };
}

export function configuredGroqModel(role: "vision"): GroqVisionModel;
export function configuredGroqModel(role: "text"): GroqTextModel;
export function configuredGroqModel(
  role: AiModelRole,
): GroqVisionModel | GroqTextModel {
  const configuration = resolveAiConfiguration();
  if (!configuration.apiKeyAvailable) {
    throw new Error("groq_unavailable");
  }
  const model = role === "vision"
    ? configuration.visionModel
    : configuration.textModel;
  if (!model) throw new Error(`groq_${role}_model_invalid`);
  return model;
}
