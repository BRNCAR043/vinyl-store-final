import type { Vinyl } from "./vinyl";

export type ProductDoc = Vinyl & {
  id: string;
  totalSold: number;
  totalRevenue: number;
  totalViews: number;
};

export type ProductKpiData = {
  topSellingAlbum: ProductDoc | null;
  highestRevenueAlbum: ProductDoc | null;
  mostViewedAlbum: ProductDoc | null;
  bestPerformingGenre: string;
  overallConversionRate: number;
  totalRevenueAll: number;
};

export type GenreRevenue = {
  genre: string;
  revenue: number;
};

export type ProductSortKey =
  | "albumName"
  | "artist"
  | "genres"
  | "totalViews"
  | "totalSold"
  | "totalRevenue"
  | "conversion";

export type ProductSortConfig = {
  key: ProductSortKey;
  direction: "asc" | "desc";
};
