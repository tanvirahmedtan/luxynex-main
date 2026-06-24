import { useProducts } from "@/hooks/useProducts";
import ProductCard from "@/components/ProductCard";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselIndicators,
} from "@/components/ui/carousel";

export default function TrendingStrip() {
  const { products, loading } = useProducts();
  const trending = products.slice(0, 8);
  if (!loading && trending.length === 0) return null;

  return (
    <section>
      <h2 className="text-xl font-bold text-foreground mb-5">
        🔥 Trending Now
      </h2>
      <Carousel opts={{ loop: false, align: "start", slidesToScroll: 1 }} className="pb-6">
        <CarouselContent className="gap-2">
          {trending.map((p) => (
            <CarouselItem key={p.id} className="min-w-[220px] max-w-[220px]">
              <ProductCard product={p} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="mt-4 flex items-center justify-center">
          <CarouselIndicators />
        </div>
      </Carousel>
    </section>
  );
}
