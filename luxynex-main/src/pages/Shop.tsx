import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "@/components/ProductCard";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import {
  SlidersHorizontal,
  X,
  LayoutGrid,
  Loader2,
  ArrowUpDown,
  Tag,
  BadgePercent,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import SEO from "@/components/SEO";
import WhatsAppFloat from "@/components/WhatsAppFloat";

export default function Shop() {
  const { products: allProducts, loading: productsLoading } = useProducts();
  const { categories } = useCategories();
  const [searchParams] = useSearchParams();
  const catFilter = searchParams.get("cat") || "";
  const query = searchParams.get("q") || "";

  const [selectedCat, setSelectedCat] = useState(catFilter);
  const [selectedSub, setSelectedSub] = useState("");

  useEffect(() => {
    setSelectedCat(catFilter);
    setSelectedSub("");
  }, [catFilter]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [sortBy, setSortBy] = useState("all");
  const [offer, setOffer] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  const currentCategory = categories.find((c) => c.id === selectedCat);

  const filtered = useMemo(() => {
    let result = allProducts;
    if (query)
      result = result.filter((p) =>
        p.name.toLowerCase().includes(query.toLowerCase()),
      );
    if (selectedCat) {
      const catName = currentCategory?.name?.toLowerCase();
      result = result.filter((p) => {
        const pc = (p.category || "").toLowerCase();
        return pc === selectedCat.toLowerCase() || (catName && pc === catName);
      });
    }
    if (selectedSub)
      result = result.filter((p) => p.subcategory === selectedSub);
    result = result.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1],
    );
    if (offer === "discount") {
      result = result.filter(
        (p) => p.originalPrice && p.originalPrice > p.price,
      );
    } else if (offer === "best-price") {
      const avg =
        result.reduce((s, p) => s + p.price, 0) / (result.length || 1);
      result = result.filter((p) => p.price <= avg);
    }
    if (sortBy === "low-high")
      result = [...result].sort((a, b) => a.price - b.price);
    else if (sortBy === "high-low")
      result = [...result].sort((a, b) => b.price - a.price);
    else if (sortBy === "best-selling")
      result = [...result].sort((a, b) => (b.reviews || 0) - (a.reviews || 0));
    else result = [...result];
    return result;
  }, [
    allProducts,
    selectedCat,
    selectedSub,
    priceRange,
    sortBy,
    offer,
    query,
    currentCategory,
  ]);

  return (
    <>
      <SEO
        title={
          query
            ? `Search "${query}" — Luxynex`
            : currentCategory
              ? `${currentCategory.name} — Luxynex Bangladesh`
              : "Shop Premium Gadgets, Attar & Perfumes — Luxynex"
        }
        description={`Shop ${currentCategory ? currentCategory.name : "gadgets, attar and perfumes"} online at Luxynex. Authentic products, best prices and fast delivery across Bangladesh.`}
        url="/shop"
      />
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-foreground">
            {query
              ? `Search: "${query}"`
              : currentCategory
                ? currentCategory.name
                : "All Products"}
          </h1>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden p-2 rounded-xl bg-muted border border-border"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>

        <div className="flex gap-6">
          {/* Sidebar Filters */}
          <aside
            className={`${showFilters ? "fixed inset-0 z-50 bg-background p-6 overflow-y-auto" : "hidden"} lg:block lg:relative lg:w-[280px] flex-shrink-0`}
          >
            {showFilters && (
              <button
                onClick={() => setShowFilters(false)}
                className="lg:hidden mb-4 p-2 rounded-xl bg-muted"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <div className="light-card p-5 space-y-6">
              <div className="flex items-center gap-2 pb-3 border-b border-border">
                <LayoutGrid className="w-4 h-4 text-primary" />
                <h4 className="text-sm font-bold">Filters</h4>
              </div>

              {/* Sort by */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <ArrowUpDown className="w-4 h-4 text-primary" />
                  <h4 className="text-sm font-semibold text-foreground">
                    Sort by
                  </h4>
                </div>
                <RadioGroup
                  value={sortBy}
                  onValueChange={setSortBy}
                  className="space-y-2"
                >
                  {[
                    { v: "all", l: "All" },
                    { v: "low-high", l: "Low to high" },
                    { v: "high-low", l: "High to low" },
                    { v: "best-selling", l: "Best selling" },
                  ].map((o) => (
                    <div key={o.v} className="flex items-center gap-2">
                      <RadioGroupItem value={o.v} id={`sort-${o.v}`} />
                      <Label
                        htmlFor={`sort-${o.v}`}
                        className="text-sm cursor-pointer"
                      >
                        {o.l}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Price Range */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Tag className="w-4 h-4 text-primary" />
                  <h4 className="text-sm font-semibold text-foreground">
                    Price Range
                  </h4>
                </div>
                <Slider
                  min={0}
                  max={100000}
                  step={500}
                  value={priceRange}
                  onValueChange={(v) =>
                    setPriceRange([v[0], v[1]] as [number, number])
                  }
                  className="mt-2"
                />
                <div className="flex justify-between mt-3 text-xs text-muted-foreground">
                  <span>৳{priceRange[0].toLocaleString()}</span>
                  <span>৳{priceRange[1].toLocaleString()}</span>
                </div>
              </div>

              {/* Offers */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <BadgePercent className="w-4 h-4 text-primary" />
                  <h4 className="text-sm font-semibold text-foreground">
                    Offers
                  </h4>
                </div>
                <RadioGroup
                  value={offer}
                  onValueChange={setOffer}
                  className="space-y-2"
                >
                  {[
                    { v: "all", l: "All" },
                    { v: "best-price", l: "Best price" },
                    { v: "discount", l: "Discount" },
                  ].map((o) => (
                    <div key={o.v} className="flex items-center gap-2">
                      <RadioGroupItem value={o.v} id={`offer-${o.v}`} />
                      <Label
                        htmlFor={`offer-${o.v}`}
                        className="text-sm cursor-pointer"
                      >
                        {o.l}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Categories */}
              <div>
                <h4 className="text-sm font-semibold mb-2 text-foreground">
                  Category
                </h4>
                <button
                  onClick={() => {
                    setSelectedCat("");
                    setSelectedSub("");
                  }}
                  className={`block w-full text-left text-sm px-3 py-2 rounded-xl mb-1 ${!selectedCat ? "bg-primary/10 text-primary font-semibold" : "text-muted-foreground hover:bg-muted"}`}
                >
                  All
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setSelectedCat(c.id);
                      setSelectedSub("");
                    }}
                    className={`block w-full text-left text-sm px-3 py-2 rounded-xl mb-1 ${selectedCat === c.id ? "bg-primary/10 text-primary font-semibold" : "text-muted-foreground hover:bg-muted"}`}
                  >
                    {c.icon} {c.name}
                  </button>
                ))}
              </div>
              {currentCategory && (
                <div>
                  <h4 className="text-sm font-semibold mb-2 text-foreground">
                    Sub-category
                  </h4>
                  <button
                    onClick={() => setSelectedSub("")}
                    className={`block w-full text-left text-sm px-3 py-2 rounded-xl mb-1 ${!selectedSub ? "bg-primary/10 text-primary font-semibold" : "text-muted-foreground hover:bg-muted"}`}
                  >
                    All
                  </button>
                  {currentCategory.subcategories.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setSelectedSub(s.name)}
                      className={`block w-full text-left text-sm px-3 py-2 rounded-xl mb-1 ${selectedSub === s.name ? "bg-primary/10 text-primary font-semibold" : "text-muted-foreground hover:bg-muted"}`}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            {productsLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">
                  Loading products...
                </span>
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground mb-4">
                  {filtered.length} products found
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filtered.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
                {filtered.length === 0 && (
                  <p className="text-center text-muted-foreground py-20">
                    No products found.
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <WhatsAppFloat />
    </>
  );
}
