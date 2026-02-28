import { describe, expect, it } from "vitest";
import { scoreBuyerPostMatch, totalMatchScore } from "../src/lib/matching";

describe("matching", () => {
  it("rewards category, location, and keywords", () => {
    const score = scoreBuyerPostMatch(
      {
        searchText: "Samsung fridge",
        categoryId: "cat-fridges",
        brandId: undefined,
        conditionPreference: "good_used",
        urgency: "medium",
        province: "Gauteng",
        cityOrTown: "Johannesburg",
        modelKeywords: ["Samsung", "fridge"],
        budgetMin: undefined,
        budgetMax: 7000,
      },
      {
        id: "rule-1",
        sellerName: "Well-Kept North",
        categoryId: "cat-fridges",
        brandId: undefined,
        province: "Gauteng",
        cityOrTown: "Johannesburg",
        minMatchScore: 70,
        isActive: true,
      },
    );

    expect(totalMatchScore(score)).toBeGreaterThanOrEqual(70);
  });
});
