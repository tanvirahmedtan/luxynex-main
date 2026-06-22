import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/data/products";

function mapRow(p: any): Product {
  return {
    id: p.id,
    name: p.name,
    price: Number(p.price),
    originalPrice: p.original_price ? Number(p.original_price) : undefined,
    image: p.images && p.images.length > 0 ? p.images[0] : "/placeholder.svg",
    category: (p.category || "").toLowerCase(),
    subcategory: p.category || "",
    badge:
      p.discount_percent && p.discount_percent > 0
        ? ("sale" as const)
        : undefined,
    rating: 4.5,
    reviews: 0,
    stock:
      p.stock > 10
        ? ("in-stock" as const)
        : p.stock > 0
          ? ("limited" as const)
          : ("out-of-stock" as const),
    description: p.description || "",
    colors: p.colors && p.colors.length > 0 ? p.colors : undefined,
    images: p.images && p.images.length > 0 ? p.images : undefined,
    sizes: p.sizes && p.sizes.length > 0 ? p.sizes : undefined,
    stockCount: typeof p.stock === "number" ? p.stock : 0,
    sku: p.sku || undefined,
  };
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from("admin_products")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (!mounted) return;
      if (error) {
        console.error("Error fetching products:", error);
        setLoading(false);
        return;
      }
      setProducts((data || []).map(mapRow));
      setLoading(false);
    };

    fetchProducts();

    const channel = supabase
      .channel(`admin_products_changes_${Math.random().toString(36).slice(2)}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "admin_products" },
        () => {
          fetchProducts();
        },
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  return { products, loading };
}
