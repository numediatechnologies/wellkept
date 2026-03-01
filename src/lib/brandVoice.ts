import type {
  BrandVoicePolicy,
  GeneratedCopyContext,
  ModerationRewriteRequest,
} from "../shared/types.js";

export const defaultBrandVoicePolicy: BrandVoicePolicy = {
  policyName: "Well-Kept Default",
  toneRules: [
    "Keep sentences short and practical.",
    "Use plain South African English.",
    "Sound warm, clear, and trustworthy.",
    "Prefer helpful guidance over sales pressure.",
  ],
  forbiddenPhrases: [
    "once in a lifetime",
    "luxury experience",
    "revolutionary",
    "best on earth",
  ],
  preferredPatterns: [
    "Good condition. Fair price. Close to home.",
    "Say what the item is, why it helps, and what the next step is.",
    "Use direct calls to action.",
  ],
  promptVersion: "2026-02-28",
};

const sentenceCase = (value: string) =>
  value
    .trim()
    .replace(/\s+/g, " ")
    .replace(/^./, (match) => match.toUpperCase());

export function enforceBrandVoice(
  text: string,
  context: GeneratedCopyContext,
  policy: BrandVoicePolicy = defaultBrandVoicePolicy,
): string {
  let normalized = sentenceCase(text);

  for (const phrase of policy.forbiddenPhrases) {
    const matcher = new RegExp(phrase, "ig");
    normalized = normalized.replace(matcher, "trusted");
  }

  if (context.format === "cta") {
    normalized = normalized.replace(/click here/gi, "Open it");
  }

  normalized = normalized
    .replace(/\butilise\b/gi, "use")
    .replace(/\bpurchase\b/gi, "buy")
    .replace(/\bassist you\b/gi, "help you")
    .replace(/\bkindly\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  if (context.locationHint && !normalized.includes(context.locationHint)) {
    normalized = `${normalized} Available around ${context.locationHint}.`;
  }

  return normalized;
}

export function rewriteForModeration(
  request: ModerationRewriteRequest,
  policy: BrandVoicePolicy = defaultBrandVoicePolicy,
): string {
  const base = enforceBrandVoice(request.sourceText, request.context, policy);
  if (request.reason.toLowerCase().includes("short")) {
    return base.split(". ").slice(0, 2).join(". ").trim();
  }
  return base;
}
