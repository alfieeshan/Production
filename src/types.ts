export interface Product {
  id: string | number;
  name: string;
  description: string;
  price: number;
  whatsapp_number: string;
  status: 'active' | 'inactive' | boolean;
  images: string[];
  created_at?: string;
  [key: string]: any; // To support dynamically mapped database columns
}

export interface ColumnMapping {
  id: string;
  name: string;
  description: string;
  price: string;
  whatsapp_number: string;
  status: string;
  images: string;
}

export interface DashboardStats {
  total: number;
  active: number;
  inactive: number;
  latest: Product | null;
}

export type SortOption =
  | 'newest'
  | 'oldest'
  | 'price_low_high'
  | 'price_high_low'
  | 'alphabetical';

export interface FilterOptions {
  search: string;
  sort: SortOption;
  status: 'all' | 'active' | 'inactive';
}
