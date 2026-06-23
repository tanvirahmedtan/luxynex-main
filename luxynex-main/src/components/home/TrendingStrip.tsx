import { useProducts } from "@/hooks/useProducts";
import ProductCard from "@/components/ProductCard";
import HorizontalScroll from "@/components/ui/HorizontalScroll";

export default function TrendingStrip() {
  const { products, loading } = useProducts();
  const trending = products.slice(0, 8);
  if (!loading && trending.length === 0) return null;
  return (
    <section>
      <h2 className="text-xl font-bold text-foreground mb-5">
        🔥 Trending Now
      </h2>
      <HorizontalScroll className="pb-4">
        {trending.map((p) => (
          <div key={p.id} className="min-w-[200px] max-w-[200px] flex-shrink-0">
            <ProductCard product={p} />
          </div>
        ))}
      </HorizontalScroll>
    </section>
  );
}
