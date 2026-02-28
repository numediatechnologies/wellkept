import type {
  Brand,
  Category,
  Geography,
  Listing,
  NotificationItem,
  RetailPriceReference,
  SellerAlertRule,
} from "../shared/types";

export const categories: Category[] = [
  {
    id: "cat-fridges",
    name: "Fridges & Freezers",
    slug: "fridges-freezers",
    description: "Cooling appliances for homes, flats, and student accommodation.",
  },
  {
    id: "cat-sofas",
    name: "Sofas & Lounge Sets",
    slug: "sofas-lounge-sets",
    description: "Comfortable seating for living rooms and family spaces.",
  },
  {
    id: "cat-washers",
    name: "Washing Machines",
    slug: "washing-machines",
    description: "Front-loader and top-loader washing machines.",
  },
  {
    id: "cat-beds",
    name: "Beds & Mattresses",
    slug: "beds-mattresses",
    description: "Bedroom essentials with budget and premium options.",
  },
];

export const brands: Brand[] = [
  { id: "brand-samsung", name: "Samsung", slug: "samsung" },
  { id: "brand-lg", name: "LG", slug: "lg" },
  { id: "brand-defy", name: "Defy", slug: "defy" },
  { id: "brand-hisense", name: "Hisense", slug: "hisense" },
  { id: "brand-coricraft", name: "Coricraft", slug: "coricraft" },
  { id: "brand-sealy", name: "Sealy", slug: "sealy" }
];

export const geographies: Geography[] = [
  {
    id: "geo-country",
    province: "South Africa",
    slug: "south-africa",
    geoType: "country",
    isIndexable: true,
  },
  {
    id: "geo-gauteng",
    province: "Gauteng",
    slug: "gauteng",
    geoType: "province",
    parentSlug: "south-africa",
    isIndexable: true,
  },
  {
    id: "geo-western-cape",
    province: "Western Cape",
    slug: "western-cape",
    geoType: "province",
    parentSlug: "south-africa",
    isIndexable: true,
  },
  {
    id: "geo-kwazulu-natal",
    province: "KwaZulu-Natal",
    slug: "kwazulu-natal",
    geoType: "province",
    parentSlug: "south-africa",
    isIndexable: true,
  },
  {
    id: "geo-johannesburg",
    province: "Gauteng",
    cityOrTown: "Johannesburg",
    slug: "johannesburg",
    geoType: "city",
    parentSlug: "gauteng",
    isIndexable: true,
  },
  {
    id: "geo-pretoria",
    province: "Gauteng",
    cityOrTown: "Pretoria",
    slug: "pretoria",
    geoType: "city",
    parentSlug: "gauteng",
    isIndexable: true,
  },
  {
    id: "geo-cape-town",
    province: "Western Cape",
    cityOrTown: "Cape Town",
    slug: "cape-town",
    geoType: "city",
    parentSlug: "western-cape",
    isIndexable: true,
  },
  {
    id: "geo-stellenbosch",
    province: "Western Cape",
    cityOrTown: "Stellenbosch",
    slug: "stellenbosch",
    geoType: "city",
    parentSlug: "western-cape",
    isIndexable: true,
  },
  {
    id: "geo-durban",
    province: "KwaZulu-Natal",
    cityOrTown: "Durban",
    slug: "durban",
    geoType: "city",
    parentSlug: "kwazulu-natal",
    isIndexable: true,
  },
];

const fridgeRetail: RetailPriceReference = {
  categoryId: "cat-fridges",
  brandId: "brand-samsung",
  amount: 11999,
  currencyCode: "ZAR",
  source: "admin_verified",
  confidence: "high",
  lastVerifiedAt: "2026-02-25",
  notes: "Comparable entry-level Samsung fridge pricing.",
};

export const listings: Listing[] = [
  {
    id: "lst-1",
    slug: "samsung-double-door-fridge-johannesburg",
    title: "Samsung double-door fridge in good condition",
    description:
      "A clean family fridge with strong cooling, neat shelves, and space for everyday use.",
    priceAmount: 6900,
    reserveDepositAmount: 800,
    condition: "good_used",
    status: "published",
    brandId: "brand-samsung",
    categoryId: "cat-fridges",
    province: "Gauteng",
    cityOrTown: "Johannesburg",
    sellerName: "Well-Kept North",
    images: [
      "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?auto=format&fit=crop&w=1200&q=80",
    ],
    retailPrice: fridgeRetail,
  },
  {
    id: "lst-2",
    slug: "defy-top-loader-pretoria",
    title: "Defy top-loader washing machine",
    description:
      "Simple to use, reliable, and a good fit for a busy home or rental unit.",
    priceAmount: 4200,
    reserveDepositAmount: 500,
    condition: "good_used",
    status: "published",
    brandId: "brand-defy",
    categoryId: "cat-washers",
    province: "Gauteng",
    cityOrTown: "Pretoria",
    sellerName: "Pretoria Appliances Hub",
    images: [
      "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    id: "lst-3",
    slug: "coricraft-three-seater-cape-town",
    title: "Coricraft three-seater sofa",
    description:
      "Comfortable seating with a clean look that works well in a lounge or Airbnb.",
    priceAmount: 5800,
    reserveDepositAmount: 700,
    condition: "good_used",
    status: "published",
    brandId: "brand-coricraft",
    categoryId: "cat-sofas",
    province: "Western Cape",
    cityOrTown: "Cape Town",
    sellerName: "Cape Home Finds",
    images: [
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
    ],
  },
];

export const sellerAlertRules: SellerAlertRule[] = [
  {
    id: "rule-1",
    sellerName: "Well-Kept North",
    categoryId: "cat-fridges",
    province: "Gauteng",
    cityOrTown: "Johannesburg",
    minMatchScore: 70,
    isActive: true,
  },
  {
    id: "rule-2",
    sellerName: "Cape Home Finds",
    categoryId: "cat-sofas",
    province: "Western Cape",
    cityOrTown: "Cape Town",
    minMatchScore: 60,
    isActive: true,
  },
];

export const notifications: NotificationItem[] = [
  {
    id: "n1",
    title: "New buyer match in Johannesburg",
    body: "A buyer is looking for a Samsung fridge near Johannesburg.",
    createdAt: "2026-02-28T10:15:00Z",
    read: false,
    type: "match",
  },
  {
    id: "n2",
    title: "Deposit paid",
    body: "Reservation deposit cleared for your Defy washing machine.",
    createdAt: "2026-02-28T08:45:00Z",
    read: true,
    type: "reservation",
  },
];
