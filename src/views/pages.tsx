import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { brands, categories, geographies, listings, notifications, sellerAlertRules } from "../lib/data";
import { detectItem, suggestBuyerPost, suggestListing } from "../lib/ai";
import { defaultBrandVoicePolicy } from "../lib/brandVoice";
import { resolveBrandName, resolveCategoryName, scoreBuyerPostMatch, totalMatchScore } from "../lib/matching";
import type { BuyerPostWizardDraft, ConditionPreference } from "../shared/types";

function currency(value?: number) {
  if (!value) return "Unknown";
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  }).format(value);
}

function HeroCard({
  title,
  description,
  cta,
  href,
}: {
  title: string;
  description: string;
  cta: string;
  href: string;
}) {
  return (
    <article className="hero-card">
      <h3>{title}</h3>
      <p>{description}</p>
      <Link to={href} className="button secondary">
        {cta}
      </Link>
    </article>
  );
}

export function HomePage() {
  return (
    <div className="page">
      <section className="hero">
        <div>
          <span className="eyebrow">South Africa focused</span>
          <h1>Buy, sell, or request appliances and furniture without the usual friction.</h1>
          <p>
            Well-Kept keeps things simple. Guided posting, clear prices, local listings, and alerts
            that help the right buyers and sellers find each other.
          </p>
          <div className="hero-actions">
            <Link to="/buyer-post/new" className="button">
              Post what you need
            </Link>
            <Link to="/seller/listing/new" className="button secondary">
              Sell an item
            </Link>
          </div>
        </div>
        <div className="hero-panel">
          <div className="stat">
            <strong>Brand voice enforced</strong>
            <span>{defaultBrandVoicePolicy.policyName}</span>
          </div>
          <div className="stat">
            <strong>Seller alerts</strong>
            <span>In-app + email via Resend</span>
          </div>
          <div className="stat">
            <strong>SEO geography</strong>
            <span>Province, city, and town landing pages</span>
          </div>
        </div>
      </section>

      <section className="grid three">
        <HeroCard
          title="Buyer wizard"
          description="Guide buyers step by step, detect the item early, and suggest the title and post copy."
          cta="Open buyer wizard"
          href="/buyer-post/new"
        />
        <HeroCard
          title="Seller wizard"
          description="Upload photos, detect category and brand, show a retail price reference, then publish."
          cta="Open seller wizard"
          href="/seller/listing/new"
        />
        <HeroCard
          title="Browse by area"
          description="Indexable category and location pages for Johannesburg, Pretoria, Cape Town, Durban, and more."
          cta="Explore geography pages"
          href="/south-africa"
        />
      </section>

      <section className="grid three">
        {listings.slice(0, 3).map((listing) => (
          <article key={listing.id} className="listing-card">
            <img src={listing.images[0]} alt={listing.title} />
            <div>
              <p className="kicker">
                {listing.cityOrTown}, {listing.province}
              </p>
              <h3>{listing.title}</h3>
              <p>{listing.description}</p>
              <div className="listing-meta">
                <strong>{currency(listing.priceAmount)}</strong>
                <span>Retail ref: {currency(listing.retailPrice?.amount)}</span>
              </div>
              <Link className="button tertiary" to={`/listing/${listing.slug}`}>
                View listing
              </Link>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

export function BrowsePage() {
  const { categorySlug, provinceSlug, citySlug } = useParams();
  const filtered = listings.filter((listing) => {
    const category = categories.find((entry) => entry.id === listing.categoryId);
    const provinceMatches = provinceSlug
      ? listing.province.toLowerCase().replace(/\s+/g, "-") === provinceSlug
      : true;
    const cityMatches = citySlug
      ? listing.cityOrTown.toLowerCase().replace(/\s+/g, "-") === citySlug
      : true;
    const categoryMatches = categorySlug ? category?.slug === categorySlug : true;
    return provinceMatches && cityMatches && categoryMatches;
  });

  return (
    <div className="page">
      <section className="section-header">
        <div>
          <span className="eyebrow">Marketplace</span>
          <h1>Browse listings by item and area</h1>
          <p>Simple browsing, clear prices, and local collection options.</p>
        </div>
        <div className="chips">
          {categories.map((category) => (
            <Link key={category.id} className="chip" to={`/browse/${category.slug}`}>
              {category.name}
            </Link>
          ))}
        </div>
      </section>
      <section className="grid two">
        {filtered.map((listing) => (
          <article key={listing.id} className="listing-card horizontal">
            <img src={listing.images[0]} alt={listing.title} />
            <div>
              <p className="kicker">{resolveCategoryName(listing.categoryId)}</p>
              <h3>{listing.title}</h3>
              <p>{listing.description}</p>
              <div className="inline-meta">
                <span>{resolveBrandName(listing.brandId)}</span>
                <span>{currency(listing.priceAmount)}</span>
                <span>{listing.cityOrTown}</span>
              </div>
              <Link className="button tertiary" to={`/listing/${listing.slug}`}>
                Open listing
              </Link>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

export function ListingDetailPage() {
  const { listingSlug } = useParams();
  const listing = listings.find((entry) => entry.slug === listingSlug) ?? listings[0];

  return (
    <div className="page">
      <section className="detail-grid">
        <img src={listing.images[0]} alt={listing.title} className="hero-image" />
        <div className="detail-panel">
          <p className="kicker">
            {resolveCategoryName(listing.categoryId)} · {resolveBrandName(listing.brandId)}
          </p>
          <h1>{listing.title}</h1>
          <p>{listing.description}</p>
          <div className="price-row">
            <strong>{currency(listing.priceAmount)}</strong>
            <span>Deposit: {currency(listing.reserveDepositAmount)}</span>
          </div>
          <div className="callout">
            <strong>Retail reference</strong>
            <span>{currency(listing.retailPrice?.amount)}</span>
            <p>{listing.retailPrice?.notes ?? "Retail price currently unavailable."}</p>
          </div>
          <div className="hero-actions">
            <button className="button">Reserve with Payfast</button>
            <button className="button secondary">Reserve with EFT</button>
          </div>
        </div>
      </section>
    </div>
  );
}

function WizardStep({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="wizard-step">
      <div className="wizard-step-head">
        <span>{number}</span>
        <h3>{title}</h3>
      </div>
      {children}
    </section>
  );
}

const defaultBuyerDraft: BuyerPostWizardDraft = {
  searchText: "Samsung fridge",
  modelKeywords: [],
  conditionPreference: "good_used",
  urgency: "medium",
};

export function BuyerWizardPage() {
  const [draft, setDraft] = useState<BuyerPostWizardDraft>(defaultBuyerDraft);
  const suggestion = useMemo(
    () => suggestBuyerPost({ text: draft.searchText, cityOrTown: draft.cityOrTown }),
    [draft.searchText, draft.cityOrTown],
  );
  const detection = useMemo(() => detectItem(draft.searchText), [draft.searchText]);
  const matchPreview = sellerAlertRules.map((rule) => {
    const score = scoreBuyerPostMatch(
      {
        ...draft,
        modelKeywords: detection.modelKeywords,
        categoryId: suggestion.detection.category.categoryId,
        brandId: suggestion.detection.brand.brandId,
      },
      rule,
    );

    return {
      rule,
      total: totalMatchScore(score),
    };
  });

  return (
    <div className="page">
      <section className="section-header">
        <div>
          <span className="eyebrow">Buyer wizard</span>
          <h1>Post what you need in a few simple steps</h1>
          <p>We help identify the item, suggest the wording, and match the right sellers.</p>
        </div>
      </section>

      <div className="wizard-layout">
        <div className="wizard-main">
          <WizardStep number={1} title="What are you looking for?">
            <label>
              Search text
              <input
                value={draft.searchText}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, searchText: event.target.value }))
                }
                placeholder="Example: Samsung fridge, queen bed, Defy washing machine"
              />
            </label>
            <div className="hint-grid">
              <div className="hint-card">
                <strong>Detected item</strong>
                <span>{detection.itemType.value}</span>
              </div>
              <div className="hint-card">
                <strong>Suggested brand</strong>
                <span>{detection.brand.value}</span>
              </div>
              <div className="hint-card">
                <strong>Suggested category</strong>
                <span>{detection.category.value}</span>
              </div>
            </div>
          </WizardStep>

          <WizardStep number={2} title="Condition and budget">
            <div className="grid two">
              <label>
                Condition preference
                <select
                  value={draft.conditionPreference}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      conditionPreference: event.target.value as ConditionPreference,
                    }))
                  }
                >
                  <option value="new">New</option>
                  <option value="refurbished">Refurbished</option>
                  <option value="good_used">Good used</option>
                  <option value="any">Any</option>
                </select>
              </label>
              <label>
                Urgency
                <select
                  value={draft.urgency}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      urgency: event.target.value as BuyerPostWizardDraft["urgency"],
                    }))
                  }
                >
                  <option value="low">No rush</option>
                  <option value="medium">Within a week</option>
                  <option value="high">As soon as possible</option>
                </select>
              </label>
              <label>
                Target budget
                <input
                  type="number"
                  value={draft.budgetMin ?? ""}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      budgetMin: Number(event.target.value) || undefined,
                    }))
                  }
                />
              </label>
              <label>
                Max budget
                <input
                  type="number"
                  value={draft.budgetMax ?? ""}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      budgetMax: Number(event.target.value) || undefined,
                    }))
                  }
                />
              </label>
            </div>
            <div className="callout">
              <strong>Retail price reference</strong>
              <span>{currency(suggestion.retailPrice.amount)}</span>
              <p>{suggestion.retailPrice.notes}</p>
            </div>
          </WizardStep>

          <WizardStep number={3} title="Location and draft copy">
            <div className="grid two">
              <label>
                Province
                <select
                  value={draft.province ?? ""}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, province: event.target.value || undefined }))
                  }
                >
                  <option value="">Select province</option>
                  {geographies
                    .filter((entry) => entry.geoType === "province")
                    .map((entry) => (
                      <option key={entry.id} value={entry.province}>
                        {entry.province}
                      </option>
                    ))}
                </select>
              </label>
              <label>
                City or town
                <input
                  value={draft.cityOrTown ?? ""}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      cityOrTown: event.target.value || undefined,
                    }))
                  }
                />
              </label>
            </div>
            <label>
              Suggested title
              <input
                value={draft.title ?? suggestion.title.value}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, title: event.target.value }))
                }
              />
            </label>
            <label>
              Suggested post
              <textarea
                rows={5}
                value={draft.description ?? suggestion.description.value}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, description: event.target.value }))
                }
              />
            </label>
          </WizardStep>
        </div>

        <aside className="wizard-side">
          <div className="panel sticky">
            <h3>Match preview</h3>
            <p>These sellers are likely to receive alerts if you publish this request.</p>
            <div className="stack">
              {matchPreview.map(({ rule, total }) => (
                <div key={rule.id} className="score-card">
                  <strong>{rule.sellerName}</strong>
                  <span>{total}% match score</span>
                </div>
              ))}
            </div>
            <button className="button full">Publish buyer request</button>
          </div>
        </aside>
      </div>
    </div>
  );
}

export function SellerWizardPage() {
  const [itemText, setItemText] = useState("Samsung fridge");
  const [cityOrTown, setCityOrTown] = useState("Johannesburg");
  const suggestion = useMemo(
    () => suggestListing({ text: itemText, cityOrTown }),
    [itemText, cityOrTown],
  );

  return (
    <div className="page">
      <section className="section-header">
        <div>
          <span className="eyebrow">Seller wizard</span>
          <h1>List an item the easy way</h1>
          <p>Start with photos and a short description. We help with the rest.</p>
        </div>
      </section>
      <div className="wizard-layout">
        <div className="wizard-main">
          <WizardStep number={1} title="Item details">
            <label>
              What are you selling?
              <input value={itemText} onChange={(event) => setItemText(event.target.value)} />
            </label>
            <div className="hint-grid">
              <div className="hint-card">
                <strong>Brand</strong>
                <span>{suggestion.detection.brand.value}</span>
              </div>
              <div className="hint-card">
                <strong>Category</strong>
                <span>{suggestion.detection.category.value}</span>
              </div>
              <div className="hint-card">
                <strong>Keywords</strong>
                <span>{suggestion.detection.modelKeywords.join(", ") || "None yet"}</span>
              </div>
            </div>
          </WizardStep>
          <WizardStep number={2} title="Pricing and location">
            <div className="grid two">
              <label>
                Asking price
                <input type="number" placeholder="6900" />
              </label>
              <label>
                Reserve deposit
                <input type="number" placeholder="800" />
              </label>
              <label>
                City or town
                <input value={cityOrTown} onChange={(event) => setCityOrTown(event.target.value)} />
              </label>
              <label>
                Province
                <select defaultValue="Gauteng">
                  <option>Gauteng</option>
                  <option>Western Cape</option>
                  <option>KwaZulu-Natal</option>
                </select>
              </label>
            </div>
            <div className="callout">
              <strong>Retail reference</strong>
              <span>{currency(suggestion.retailPrice.amount)}</span>
              <p>{suggestion.retailPrice.notes}</p>
            </div>
          </WizardStep>
          <WizardStep number={3} title="Suggested listing copy">
            <label>
              Listing title
              <input defaultValue={suggestion.title.value} />
            </label>
            <label>
              Listing description
              <textarea rows={5} defaultValue={suggestion.description.value} />
            </label>
            <button className="button">Save and submit for moderation</button>
          </WizardStep>
        </div>
        <aside className="wizard-side">
          <div className="panel sticky">
            <h3>Brand voice checks</h3>
            <ul className="plain-list">
              {defaultBrandVoicePolicy.toneRules.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

export function AlertsPage() {
  return (
    <div className="page">
      <section className="section-header">
        <div>
          <span className="eyebrow">Alerts</span>
          <h1>Seller notifications</h1>
          <p>In-app and email-ready alerts for matches, reservations, and moderation.</p>
        </div>
      </section>
      <div className="grid two">
        {notifications.map((notification) => (
          <article key={notification.id} className="panel">
            <p className="kicker">{notification.type}</p>
            <h3>{notification.title}</h3>
            <p>{notification.body}</p>
            <small>{new Date(notification.createdAt).toLocaleString("en-ZA")}</small>
          </article>
        ))}
      </div>
    </div>
  );
}

export function DashboardPage() {
  return (
    <div className="page">
      <section className="grid three">
        <article className="panel">
          <h3>Live categories</h3>
          <strong>{categories.length}</strong>
          <p>Seeded marketplace categories ready for Supabase sync.</p>
        </article>
        <article className="panel">
          <h3>Geography pages</h3>
          <strong>{geographies.filter((entry) => entry.isIndexable).length}</strong>
          <p>Province and city/town entries prepared for sitemap chunks.</p>
        </article>
        <article className="panel">
          <h3>Brand catalogue</h3>
          <strong>{brands.length}</strong>
          <p>Marketplace-style brand selection and matching support.</p>
        </article>
      </section>
    </div>
  );
}

export function AdminPage() {
  return (
    <div className="page">
      <section className="section-header">
        <div>
          <span className="eyebrow">Admin</span>
          <h1>Moderation and governance</h1>
          <p>Review listings, buyer posts, AI suggestions, retail price references, and brand voice rules.</p>
        </div>
      </section>
      <div className="grid two">
        <article className="panel">
          <h3>Brand voice defaults</h3>
          <ul className="plain-list">
            {defaultBrandVoicePolicy.preferredPatterns.map((pattern) => (
              <li key={pattern}>{pattern}</li>
            ))}
          </ul>
        </article>
        <article className="panel">
          <h3>Moderation queues</h3>
          <ul className="plain-list">
            <li>Pending listings</li>
            <li>Pending buyer posts</li>
            <li>Retail price verification</li>
            <li>EFT confirmations</li>
          </ul>
        </article>
      </div>
    </div>
  );
}

export function GeographyPage() {
  const { provinceSlug, citySlug } = useParams();
  const provinces = geographies.filter((entry) => entry.geoType === "province");
  const cities = geographies.filter((entry) => entry.geoType === "city");

  return (
    <div className="page">
      <section className="section-header">
        <div>
          <span className="eyebrow">South Africa</span>
          <h1>
            {citySlug
              ? `Listings and requests near ${citySlug.replace(/-/g, " ")}`
              : provinceSlug
                ? `Browse by ${provinceSlug.replace(/-/g, " ")}`
                : "Browse appliances and furniture by area"}
          </h1>
          <p>SEO-ready province and city landing pages for local discovery.</p>
        </div>
      </section>
      <div className="grid two">
        <article className="panel">
          <h3>Provinces</h3>
          <div className="chips">
            {provinces.map((province) => (
              <Link key={province.id} className="chip" to={`/south-africa/${province.slug}`}>
                {province.province}
              </Link>
            ))}
          </div>
        </article>
        <article className="panel">
          <h3>Cities and towns</h3>
          <div className="chips">
            {cities.map((city) => (
              <Link
                key={city.id}
                className="chip"
                to={`/south-africa/${city.parentSlug}/${city.slug}`}
              >
                {city.cityOrTown}
              </Link>
            ))}
          </div>
        </article>
      </div>
    </div>
  );
}

export function NotFoundPage() {
  return (
    <div className="page narrow">
      <h1>Page not found</h1>
      <p>That page is not available yet. Head back to the Well-Kept home page.</p>
      <Link to="/" className="button">
        Go home
      </Link>
    </div>
  );
}
