import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import { scoreBuyerPostMatch, sellerAlertRules, totalMatchScore } from "../_lib/domain";
import { allowMethods, json } from "../_lib/http";

const schema = z.object({
  draft: z.object({
    searchText: z.string().min(2),
    categoryId: z.string().optional(),
    brandId: z.string().optional(),
    province: z.string().optional(),
    cityOrTown: z.string().optional(),
    budgetMax: z.number().optional(),
    modelKeywords: z.array(z.string()).default([]),
  }),
});

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (!allowMethods(req, res, ["POST"])) return;
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return json(res, 400, { error: "Invalid body", issues: parsed.error.issues });
  }

  const matches = sellerAlertRules
    .map((rule) => {
      const breakdown = scoreBuyerPostMatch(
        {
          conditionPreference: "any",
          urgency: "medium",
          budgetMin: undefined,
          ...parsed.data.draft,
        },
        rule,
      );

      return {
        sellerName: rule.sellerName,
        matchScore: totalMatchScore(breakdown),
        breakdown,
      };
    })
    .filter((entry) => entry.matchScore > 0)
    .sort((left, right) => right.matchScore - left.matchScore)
    .slice(0, 10);

  return json(res, 200, {
    processed: matches.length,
    bounded: true,
    matches,
  });
}
