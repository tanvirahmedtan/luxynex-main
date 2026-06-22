export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  subcategory: string;
  badge?: "new" | "hot" | "sale";
  rating: number;
  reviews: number;
  stock: "in-stock" | "limited" | "out-of-stock";
  description: string;
  colors?: string[];
  images?: string[];
  sizes?: string[];
  stockCount?: number;
  sku?: string;
}

// All products are now managed via the admin panel and fetched from the database.
// See src/hooks/useProducts.ts and src/hooks/useCategories.ts.
export const products: Product[] = [];
export const categories: {
  id: string;
  name: string;
  icon: string;
  subcategories: string[];
}[] = [];
