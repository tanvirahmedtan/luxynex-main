import { Link } from "react-router-dom";
import { useCategories } from "@/hooks/useCategories";
import { useIsMobile } from "@/hooks/use-mobile";

export default function MobileCategories() {
  const isMobile = useIsMobile();
  const { categories, loading } = useCategories();

  if (!isMobile || loading || categories.length === 0) return null;

  return (
    <section className="px-4 mb-6">
      <h2 className="text-lg font-bold text-foreground mb-3">CATEGORIES</h2>
      <div className="overflow-x-auto scrollbar-hide pb-2">
        <div className="grid grid-cols-4 grid-rows-2 gap-3 w-max">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/shop?cat=${cat.slug}`}
              className="flex flex-col items-center p-3 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center mb-2">
                {cat.image_url ? (
                  <img
                    src={cat.image_url}
                    alt={cat.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-2xl">{cat.icon}</span>
                )}
              </div>
              <span className="text-xs font-medium text-gray-700 text-center line-clamp-2">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
