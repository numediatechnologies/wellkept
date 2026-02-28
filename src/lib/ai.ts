import { brands, categories } from "./data";
import { enforceBrandVoice } from "./brandVoice";
import type {
  AIBuyerPostSuggestion,
  AICategorySuggestion,
  AIDetectionResult,
  AIListingSuggestion,
  AIRetailPriceEstimate,
  AIConfidenceBand,
} from "../shared/types";

function confidenceFromSignal(score: number): AIConfidenceBand {
  if (score >= 80) return "high";
  if (score >= 50) return "medium";
  return "low";
}

function slugMatch(input: string, candidates: { id: string; name: string }[]) {
  const lower = input.toLowerCase();
  const candidate = candidates.find((entry) =>
    lower.includes(entry.name.toLowerCase()),
  );
  return candidate;
}

function inferCategory(text: string): AICategorySuggestion {
  const lower = text.toLowerCase();
  const rules = [
    ["fridge", "cat-fridges", "Fridge"],
    ["freezer", "cat-fridges", "Freezer"],
    ["washing", "cat-washers", "Washing machine"],
    ["sofa", "cat-sofas", "Sofa"],
    ["couch", "cat-sofas", "Couch"],
    ["bed", "cat-beds", "Bed"],
    ["mattress", "cat-beds", "Mattress"],
  ] as const;

  for (const [needle, categoryId, label] of rules) {
    if (lower.includes(needle)) {
      const category = categories.find((entry) => entry.id === categoryId);
      return {
        value: label,
        categoryId,
        confidence: "high",
        reasoning: `${needle} strongly suggests ${category?.name ?? label}.`,
      };
    }
  }

  return {
    value: "Household item",
    confidence: "low",
    reasoning: "No clear product keyword was found.",
  };
}

function inferBrand(text: string) {
  const match = slugMatch(text, brands);
  const confidence = match ? "high" : "low";
  return {
    value: match?.name ?? "Unknown brand",
    brandId: match?.id,
    confidence,
    reasoning: match
      ? `The brand name ${match.name} was found in the text.`
      : "No brand was found. Let the user choose from the list.",
  } as const;
}

function inferItemType(text: string) {
  const category = inferCategory(text);
  return {
    value: category.value,
    confidence: category.confidence,
    reasoning: category.reasoning,
  };
}

function inferModelKeywords(text: string) {
  return text
    .split(/\s+/)
    .map((part) => part.replace(/[^a-zA-Z0-9-]/g, ""))
    .filter((part) => part.length >= 3)
    .slice(0, 4);
}

function inferRetailPrice(text: string, categoryId?: string): AIRetailPriceEstimate {
  const lower = text.toLowerCase();
  if (lower.includes("samsung") && lower.includes("fridge")) {
    return {
      amount: 11999,
      currencyCode: "ZAR",
      source: "admin_verified",
      confidence: "high",
      notes: "Comparable Samsung fridge pricing from the internal reference set.",
    };
  }

  if (categoryId === "cat-sofas") {
    return {
      amount: 8999,
      currencyCode: "ZAR",
      source: "ai_estimate",
      confidence: "medium",
      notes: "Estimated from similar three-seater lounge listings.",
    };
  }

  return {
    currencyCode: "ZAR",
    source: "unknown",
    confidence: "low",
    notes: "Retail price currently unavailable.",
  };
}

export function detectItem(text: string): AIDetectionResult {
  const category = inferCategory(text);
  const brand = inferBrand(text);

  return {
    itemType: inferItemType(text),
    category,
    brand,
    modelKeywords: inferModelKeywords(text),
  };
}

function makeTitle(baseText: string, cityOrTown?: string) {
  const clean = baseText.replace(/\s+/g, " ").trim();
  return enforceBrandVoice(
    cityOrTown ? `${clean} near ${cityOrTown}` : clean,
    {
      audience: "public",
      format: "title",
      locationHint: cityOrTown,
    },
  );
}

function makeDescription(
  mode: "listing" | "buyer_post",
  text: string,
  cityOrTown?: string,
) {
  const raw =
    mode === "listing"
      ? `A simple, trusted listing for ${text}. Good condition, fair price, and clear next steps.`
      : `I am looking for ${text}. Please share options in good condition and close to my area.`;

  return enforceBrandVoice(raw, {
    audience: mode === "listing" ? "seller" : "buyer",
    format: "description",
    locationHint: cityOrTown,
  });
}

export function suggestListing(input: {
  text: string;
  cityOrTown?: string;
}): AIListingSuggestion {
  const detection = detectItem(input.text);
  const retailPrice = inferRetailPrice(input.text, detection.category.categoryId);
  const score =
    (detection.category.confidence === "high" ? 40 : 10) +
    (detection.brand.confidence === "high" ? 30 : 5) +
    Math.min(detection.modelKeywords.length * 10, 30);
  const confidence = confidenceFromSignal(score);

  return {
    detection,
    title: {
      value: makeTitle(input.text, input.cityOrTown),
      confidence,
      reasoning: "Built from the detected item and location with the Well-Kept tone.",
    },
    description: {
      value: makeDescription("listing", input.text, input.cityOrTown),
      confidence,
      reasoning: "Generated with the platform brand voice rules.",
    },
    retailPrice,
  };
}

export function suggestBuyerPost(input: {
  text: string;
  cityOrTown?: string;
}): AIBuyerPostSuggestion {
  const detection = detectItem(input.text);
  const retailPrice = inferRetailPrice(input.text, detection.category.categoryId);
  const score =
    (detection.category.confidence === "high" ? 35 : 10) +
    (detection.brand.confidence === "high" ? 35 : 5) +
    Math.min(detection.modelKeywords.length * 10, 30);
  const confidence = confidenceFromSignal(score);

  return {
    detection,
    title: {
      value: makeTitle(`Looking for ${input.text}`, input.cityOrTown),
      confidence,
      reasoning: "Built from the wanted item and location with a simple title style.",
    },
    description: {
      value: makeDescription("buyer_post", input.text, input.cityOrTown),
      confidence,
      reasoning: "Generated with the platform brand voice rules.",
    },
    retailPrice,
  };
}
