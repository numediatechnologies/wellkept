export type UserRole = "buyer" | "seller" | "admin" | "super_admin";
export type AIConfidenceBand = "high" | "medium" | "low";
export type PaymentMethod = "payfast" | "eft";
export type PaymentStatus = "pending" | "paid" | "failed" | "awaiting_review";
export type ListingStatus = "draft" | "pending_review" | "published" | "archived";
export type ConditionPreference = "new" | "refurbished" | "good_used" | "any";
export type GeographyType = "country" | "province" | "city";

export interface BrandVoicePolicy {
  policyName: string;
  toneRules: string[];
  forbiddenPhrases: string[];
  preferredPatterns: string[];
  promptVersion: string;
}

export interface GeneratedCopyContext {
  audience: "buyer" | "seller" | "admin" | "public";
  format: "title" | "description" | "email" | "cta";
  locationHint?: string;
}

export interface ModerationRewriteRequest {
  sourceText: string;
  context: GeneratedCopyContext;
  reason: string;
}

export interface AIContentSuggestion {
  value: string;
  confidence: AIConfidenceBand;
  reasoning: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export interface Geography {
  id: string;
  province: string;
  cityOrTown?: string;
  slug: string;
  geoType: GeographyType;
  parentSlug?: string;
  isIndexable: boolean;
}

export interface RetailPriceReference {
  brandId?: string;
  categoryId: string;
  amount?: number;
  currencyCode: "ZAR";
  source: "catalog" | "admin_verified" | "ai_estimate" | "unknown";
  confidence: AIConfidenceBand;
  lastVerifiedAt?: string;
  notes: string;
}

export interface Listing {
  id: string;
  slug: string;
  title: string;
  description: string;
  priceAmount: number;
  reserveDepositAmount?: number;
  condition: ConditionPreference;
  status: ListingStatus;
  brandId?: string;
  categoryId: string;
  province: string;
  cityOrTown: string;
  sellerName: string;
  images: string[];
  retailPrice?: RetailPriceReference;
}

export interface BuyerPost {
  id: string;
  title: string;
  description: string;
  categoryId?: string;
  brandId?: string;
  budgetMin?: number;
  budgetMax?: number;
  conditionPreference: ConditionPreference;
  province: string;
  cityOrTown: string;
  aiConfidence: AIConfidenceBand;
}

export interface BuyerPostWizardDraft {
  searchText: string;
  modelKeywords: string[];
  categoryId?: string;
  brandId?: string;
  conditionPreference: ConditionPreference;
  urgency: "low" | "medium" | "high";
  budgetMin?: number;
  budgetMax?: number;
  province?: string;
  cityOrTown?: string;
  title?: string;
  description?: string;
}

export interface AIDetectionResult {
  itemType: AIContentSuggestion;
  category: AICategorySuggestion;
  brand: AIBrandSuggestion;
  modelKeywords: string[];
}

export interface AIBrandSuggestion extends AIContentSuggestion {
  brandId?: string;
}

export interface AICategorySuggestion extends AIContentSuggestion {
  categoryId?: string;
}

export interface AIRetailPriceEstimate {
  amount?: number;
  currencyCode: "ZAR";
  source: RetailPriceReference["source"];
  confidence: AIConfidenceBand;
  notes: string;
}

export interface AIListingSuggestion {
  detection: AIDetectionResult;
  title: AIContentSuggestion;
  description: AIContentSuggestion;
  retailPrice: AIRetailPriceEstimate;
}

export interface AIBuyerPostSuggestion {
  detection: AIDetectionResult;
  title: AIContentSuggestion;
  description: AIContentSuggestion;
  retailPrice: AIRetailPriceEstimate;
}

export interface MatchScoreBreakdown {
  category: number;
  brand: number;
  location: number;
  price: number;
  keywords: number;
}

export interface SellerAlertRule {
  id: string;
  sellerName: string;
  categoryId?: string;
  brandId?: string;
  province?: string;
  cityOrTown?: string;
  minMatchScore: number;
  isActive: boolean;
}

export interface SellerAlertEvent {
  id: string;
  title: string;
  body: string;
  channel: "in_app" | "email";
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  type: "match" | "reservation" | "moderation" | "manual";
}
