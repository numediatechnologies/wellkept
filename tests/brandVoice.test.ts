import { describe, expect, it } from "vitest";
import { enforceBrandVoice } from "../src/lib/brandVoice";

describe("enforceBrandVoice", () => {
  it("removes forbidden sales language and keeps a plain tone", () => {
    const value = enforceBrandVoice("This revolutionary luxury experience helps you purchase faster.", {
      audience: "public",
      format: "description",
    });

    expect(value).not.toMatch(/revolutionary/i);
    expect(value).not.toMatch(/luxury experience/i);
    expect(value).toMatch(/buy/i);
  });
});
