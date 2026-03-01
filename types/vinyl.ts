export interface Vinyl {
  id?: string;
  albumName: string;
  artist: string;
  year: number | string;
  price: number;
  cost?: number;
  tags?: string[];
  salePrice?: number | null;
  onSale?: boolean;
  condition?: string;
  genres?: string;
  description?: string;
  imageUrl?: string;
  totalSold?: number;
  totalRevenue?: number;
  totalViews?: number;
}
