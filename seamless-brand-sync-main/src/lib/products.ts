import shoe1 from "@/assets/shoe-1.jpg";
import shoe2 from "@/assets/shoe-2.jpg";
import shoe3 from "@/assets/shoe-3.jpg";
import shoe4 from "@/assets/shoe-4.jpg";
import shoe5 from "@/assets/shoe-5.jpg";
import shoe6 from "@/assets/shoe-6.jpg";
import lifestyleMen from "@/assets/lifestyle-men.jpg";
import lifestyleWomen from "@/assets/lifestyle-women.jpg";

export type ProductView = {
  label: "Front" | "Side" | "Back" | "Top" | "Sole" | "Lifestyle";
  src: string;
};

export type Category = "Men" | "Women" | "Kids";
export type Collection = "Sports" | "Casual" | "Formal" | "Trending" | "New Arrival";

export type Product = {
  id: string;
  _id?: string;
  artNumber?: string;
  name: string;
  /** Audience the product is built for. */
  category: Category;
  /** Marketing collection used by the Collection filter. */
  collection: Collection;
  /** Sub-type used by the trend / lifestyle copy. */
  type: "Running" | "Basketball" | "Lifestyle" | "School" | "Casual" | "Formal" | "Trail";
  price: number;
  oldPrice?: number;
  rating: number;
  reviews: number;
  stock: number;
  image: string;
  colors: { name: string; hex: string; stock?: number }[];
  sizes: number[];
  outOfStockSizes?: number[];
  description: string;
  isNew?: boolean;
  trending?: boolean;
  bestSelling?: boolean;
  views?: ProductView[];
};

const baseSizes = [6, 7, 8, 9, 10, 11, 12];

// Helper: generate a 6-view gallery for each product from the available assets.
// In production these would be distinct front/side/back/top/sole/lifestyle
// photos served from Cloudinary or storage.
const buildViews = (primary: string, alt: string, lifestyle: string): ProductView[] => [
  { label: "Front", src: primary },
  { label: "Side", src: alt },
  { label: "Back", src: primary },
  { label: "Top", src: alt },
  { label: "Sole", src: primary },
  { label: "Lifestyle", src: lifestyle },
];

export const products: Product[] = [];

export const getProduct = (id: string) => products.find((p) => p.id === id);

export const getRelated = (id: string) => {
  const current = products.find((p) => p.id === id);
  if (!current) return products.slice(0, 4);
  // Prefer same category, fall back to other products
  const same = products.filter((p) => p.id !== id && p.category === current.category);
  const others = products.filter((p) => p.id !== id && p.category !== current.category);
  return [...same, ...others].slice(0, 4);
};

/** Products that share at least one colour name with the given color. */
export const getSimilarByColor = (id: string, colorName: string) =>
  products
    .filter((p) => p.id !== id && p.colors.some((c) => c.name === colorName))
    .slice(0, 4);

export const categories = ["All", "Men", "Women", "Kids"] as const;
export const collections = ["All", "Sports", "Casual", "Formal", "Trending", "New Arrival"] as const;
export const sortOptions = [
  "Top Trending",
  "Price: Low to High",
  "Price: High to Low",
  "Newest",
  "Best Selling",
] as const;

/** Unique colour swatches across the whole catalogue, used by Shop colour filter. */
export const allColors = (() => {
  const map = new Map<string, string>();
  products.forEach((p) => p.colors.forEach((c) => map.set(c.name, c.hex)));
  return Array.from(map, ([name, hex]) => ({ name, hex }));
})();

// Mock color-specific reviews — in production these come from /api/reviews/:productId
export type Review = {
  name: string;
  rating: number;
  text: string;
  days: number;
  color: string;
  verified: boolean;
};

export const reviewsByProduct: Record<string, Review[]> = {
  "velocity-pro": [
    { name: "Aaron M.", rating: 5, text: "Insane comfort and the build quality is top tier.", days: 3, color: "Solar Orange", verified: true },
    { name: "Priya S.", rating: 5, text: "True to size and even better in person. Obsessed.", days: 9, color: "White Flash", verified: true },
    { name: "Muhammed ", rating: 4, text: "Great shoe, wish it came in more colours.", days: 14, color: "Carbon", verified: true },
    { name: "Mia R.", rating: 5, text: "Orange pops in person — runs feel effortless.", days: 21, color: "Solar Orange", verified: true },
  ],
};

export const getReviews = (productId: string, color?: string): Review[] => {
  const all = reviewsByProduct[productId] ?? [
    { name: "Sam K.", rating: 5, text: "Quality is unreal for the price.", days: 5, color: "Solar Orange", verified: true },
    { name: "Sharon T.", rating: 4, text: "Comfortable and stylish — daily driver.", days: 12, color: "Blackout", verified: true },
    { name: "Basil B.", rating: 5, text: "Fit is perfect and looks even better in person.", days: 19, color: "Solar Orange", verified: true },
  ];
  return color ? all.filter((r) => r.color === color) : all;
};
