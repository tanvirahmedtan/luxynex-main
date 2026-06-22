import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface UICategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
  image_url?: string | null;
  subcategories: { id: string; name: string; slug: string }[];
}

export function useCategories() {
  const [categories, setCategories] = useState<UICategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      const { data, error } = await supabase
        .from("admin_categories")
        .select("id, name, slug, parent_id, image_url, sort_order")
        .eq("is_active", true)
        .order("sort_order");

      if (!mounted) return;
      if (error) {
        console.error("Error fetching categories:", error);
        setLoading(false);
        return;
      }

      const all = data || [];
      const parents = all.filter((c: any) => !c.parent_id);
      const ui: UICategory[] = parents.map((p: any) => ({
        id: p.slug || p.id,
        name: p.name,
        slug: p.slug,
        icon: "📦",
        image_url: p.image_url,
        subcategories: all
          .filter((c: any) => c.parent_id === p.id)
          .map((s: any) => ({ id: s.id, name: s.name, slug: s.slug })),
      }));
      setCategories(ui);
      setLoading(false);
    };

    load();

    const channel = supabase
      .channel(
        `admin_categories_changes_${Math.random().toString(36).slice(2)}`,
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "admin_categories" },
        () => load(),
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  return { categories, loading };
}
