import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";
import { useProducts } from "@/hooks/useProducts";
import ProductCard from "@/components/ProductCard";

export default function CategorySections() {
  const { categories, loading: catLoading } = useCategories();
  const { products, loading: prodLoading } = useProducts();

  if (catLoading || prodLoading) return null;

  return (
    <div className="space-y-10">
      {categories.map((cat) => {
        const items = products
          .filter((p) => {
            const pc = (p.category || "").toLowerCase();
            return (
              pc === cat.slug.toLowerCase() || pc === cat.name.toLowerCase()
            );
          })
          .slice(0, 8);
        if (items.length === 0) return null;
        return (
          <section key={cat.id}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                {cat.image_url ? (
                  <img
                    src={cat.image_url}
                    alt={cat.name}
                    className="w-7 h-7 rounded-full object-cover"
                  />
                ) : (
                  <span>{cat.icon}</span>
                )}
                {cat.name}
              </h2>
              <Link
                to={`/shop?cat=${cat.slug}`}
                className="text-sm font-semibold text-primary hover:underline flex items-center gap-1"
              >
                See More <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
              {items.map((p) => (
                <div
                  key={p.id}
                  className="min-w-[200px] max-w-[200px] flex-shrink-0"
                >
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
