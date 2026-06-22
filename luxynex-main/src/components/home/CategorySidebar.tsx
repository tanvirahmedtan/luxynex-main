import { Link } from "react-router-dom";
import { useCategories } from "@/hooks/useCategories";
import { LayoutGrid } from "lucide-react";

export default function CategorySidebar() {
  const { categories, loading } = useCategories();
  return (
    <div className="light-card flex h-full min-h-[280px] flex-col overflow-hidden p-3 sm:min-h-[380px] lg:h-[380px] xl:h-[420px] 2xl:h-[460px] lg:p-4">
      <div className="mb-3 flex flex-shrink-0 items-center gap-2 border-b border-border pb-2.5">
        <LayoutGrid className="w-5 h-5 text-primary" />
        <h3 className="font-bold text-foreground text-sm">Categories</h3>
      </div>
      <div className="scrollbar-thin scrollbar-thumb-gray-200 scrollbar-thumb-rounded-full scrollbar-track-transparent flex-1 min-h-0 space-y-2 overflow-y-auto pr-1">
        {loading && (
          <p className="text-xs text-muted-foreground px-3 py-2">Loading…</p>
        )}
        {!loading && categories.length === 0 && (
          <p className="text-xs text-muted-foreground px-3 py-2">
            No categories yet.
          </p>
        )}
        {categories.map((cat) => (
          <Link
            key={cat.id}
            to={`/shop?cat=${cat.slug}`}
            className="group flex items-center gap-3 rounded-xl bg-muted px-3 py-3.5 text-sm font-medium text-foreground transition-all duration-200 hover:bg-primary/10 hover:text-primary"
          >
            {cat.image_url ? (
              <img
                src={cat.image_url}
                alt={cat.name}
                loading="lazy"
                className="w-8 h-8 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <span className="w-8 h-8 rounded-full bg-background flex items-center justify-center text-lg flex-shrink-0">
                {cat.icon}
              </span>
            )}
            <span className="group-hover:translate-x-0.5 transition-transform duration-200 line-clamp-1">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
