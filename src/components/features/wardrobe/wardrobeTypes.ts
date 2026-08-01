export type WardrobeItem = {
  id: string;
  name: string;
  category: string;
  color: string;
  seasons: string[];
  brand: string | null;
  price: number | null;
  memo: string | null;
  imageUrl: string | null;
  createdAt: string;
};

export type SortKey =
  | "createdAt-desc"
  | "createdAt-asc"
  | "price-desc"
  | "price-asc";

export type WardrobeFilters = {
  category: string | null;
  color: string | null;
  season: string | null;
  query: string;
  sort: SortKey;
};
