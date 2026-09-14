import { Link } from "react-router-dom";
import { useCategories } from "@/hooks/useCategories";
import { useIsMobile } from "@/hooks/use-mobile";

export default function MobileCategories() {
  const isMobile = useIsMobile();
  const { categories, loading } = useCategories();

  if (!isMobile || loading || categories.length === 0) return null;

  return (
    <section className="mb-6 min-w-0 overflow-hidden px-4">
      <h2 className="mb-3 text-lg font-bold text-foreground">CATEGORIES</h2>
      <div className="min-w-0 overflow-x-auto overscroll-x-contain pb-2 scrollbar-hide">
        <div className="grid w-max min-w-0 auto-rows-[128px] grid-flow-col grid-rows-2 gap-3">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/shop?cat=${cat.slug}`}
              className="flex h-full w-[76px] flex-col items-center justify-start overflow-hidden rounded-lg border border-gray-100 bg-white p-2.5 shadow-sm transition-shadow hover:shadow-md sm:w-[84px]"
            >
              <div className="mb-2 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orange-50 sm:h-14 sm:w-14">
                {cat.image_url ? (
                  <img
                    src={cat.image_url}
                    alt={cat.name}
                    className="h-9 w-9 rounded-full object-cover sm:h-10 sm:w-10"
                  />
                ) : (
                  <span className="text-xl sm:text-2xl">{cat.icon}</span>
                )}
              </div>
              <span className="line-clamp-2 w-full text-center text-[11px] font-medium leading-tight text-gray-700 sm:text-xs">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
