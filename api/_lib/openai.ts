import { categories, brands } from "./domain";
import { serverEnv } from "./env";
import type { AIBuyerPostSuggestion, AIListingSuggestion } from "../../src/shared/types";
import { suggestBuyerPost, suggestListing } from "../../src/lib/ai";

type SuggestionMode = "listing" | "buyer_post";

function buildPrompt(mode: SuggestionMode, text: string, cityOrTown?: string) {
  const categoryOptions = categories.map((entry) => `${entry.id}:${entry.name}`).join(", ");
  const brandOptions = brands.map((entry) => `${entry.id}:${entry.name}`).join(", ");

  return [
    "You are generating strict JSON for a South African appliances and furniture marketplace.",
    "Use a friendly, clear, practical brand voice. Keep wording plain and helpful.",
    `Mode: ${mode}`,
    `User text: ${text}`,
    `Location hint: ${cityOrTown ?? "unknown"}`,
    `Categories: ${categoryOptions}`,
    `Brands: ${brandOptions}`,
    'Return only valid JSON with keys: detection, title, description, retailPrice.',
    'detection keys: itemType, category, brand, modelKeywords.',
    'Each suggestion object must have: value, confidence, reasoning.',
    'category may include categoryId. brand may include brandId.',
    'retailPrice keys: amount, currencyCode, source, confidence, notes.',
  ].join("\n");
}

function extractFirstJsonBlock(text: string) {
  const match = text.match(/\{[\s\S]*\}/);
  return match?.[0];
}

async function callOpenAi(mode: SuggestionMode, text: string, cityOrTown?: string) {
  if (!serverEnv.openAiApiKey) {
    return null;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 9000);

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${serverEnv.openAiApiKey}`,
      },
      body: JSON.stringify({
        model: serverEnv.openAiModel,
        input: buildPrompt(mode, text, cityOrTown),
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as { output_text?: string };
    const rawText = payload.output_text ?? "";
    const jsonBlock = extractFirstJsonBlock(rawText);
    if (!jsonBlock) {
      return null;
    }

    return JSON.parse(jsonBlock) as AIListingSuggestion | AIBuyerPostSuggestion;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export async function suggestWithOpenAi(input: {
  mode: SuggestionMode;
  text: string;
  cityOrTown?: string;
}) {
  const live = await callOpenAi(input.mode, input.text, input.cityOrTown);
  if (live) {
    return live;
  }

  return input.mode === "listing"
    ? suggestListing({ text: input.text, cityOrTown: input.cityOrTown })
    : suggestBuyerPost({ text: input.text, cityOrTown: input.cityOrTown });
}
