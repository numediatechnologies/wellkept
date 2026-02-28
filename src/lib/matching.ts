import { brands, categories } from "./data";
import type {
  BuyerPostWizardDraft,
  MatchScoreBreakdown,
  SellerAlertRule,
} from "../shared/types";

export function scoreBuyerPostMatch(
  draft: BuyerPostWizardDraft,
  rule: SellerAlertRule,
): MatchScoreBreakdown {
  const category = draft.categoryId && draft.categoryId === rule.categoryId ? 35 : 0;
  const brand = draft.brandId && draft.brandId === rule.brandId ? 20 : 0;
  const location =
    draft.province === rule.province
      ? draft.cityOrTown === rule.cityOrTown
        ? 25
        : 15
      : 0;

  const keywords = draft.modelKeywords.length > 0 ? 10 : 0;
  const price = draft.budgetMax ? 10 : 0;

  return { category, brand, location, keywords, price };
}

export function totalMatchScore(score: MatchScoreBreakdown) {
  return score.category + score.brand + score.location + score.keywords + score.price;
}

export function resolveBrandName(brandId?: string) {
  return brands.find((entry) => entry.id === brandId)?.name ?? "No brand selected";
}

export function resolveCategoryName(categoryId?: string) {
  return (
    categories.find((entry) => entry.id === categoryId)?.name ??
    "No category selected"
  );
}
