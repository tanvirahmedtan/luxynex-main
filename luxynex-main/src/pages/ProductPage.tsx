import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

import ProductCard from "@/components/ProductCard";
import { useProducts } from "@/hooks/useProducts";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Heart,
  ShoppingCart,
  Star,
  Minus,
  Plus,
  ChevronRight,
  Loader2,
  Truck,
  ShieldCheck,
  RefreshCw,
  Info,
  Copy,
  Check,
  Tag,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import SEO from "@/components/SEO";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { Skeleton } from "@/components/ui/skeleton";

type CouponRow = { code: string; description: string };

export default function ProductPage() {
  const { id } = useParams();
  const { products, loading } = useProducts();
  const product = products.find((p) => p.id === id);
  const productVariants = Array.isArray(product?.variants)
    ? (product.variants as unknown[])
    : [];
  const productAttributes = Array.isArray(product?.attributes)
    ? (product.attributes as unknown[])
    : [];
  const productColors = Array.isArray(product?.colors)
    ? (product.colors as string[])
    : [];
  const productSizes = Array.isArray(product?.sizes)
    ? (product.sizes as string[])
    : [];
  const { addToCart, clearCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { user } = useAuth();
  const navigate = useNavigate();

  const gallery = useMemo(() => {
    if (!product) return [];
    const imgs =
      product.images && product.images.length > 0
        ? product.images
        : [product.image];
    return imgs.filter(Boolean);
  }, [product]);

  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [shakeVariants, setShakeVariants] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [tab, setTab] = useState<
    "description" | "specs" | "exchange" | "notice"
  >("description");
  const [coupons, setCoupons] = useState<CouponRow[]>([]);

  const hasColorSelection = Boolean(productColors.length > 0);
  const hasSizeSelection = Boolean(productSizes.length > 0);
  const isVariantSelectionComplete =
    (!hasColorSelection || Boolean(selectedColor)) &&
    (!hasSizeSelection || Boolean(selectedSize));

  const selectedVariantLabel = [
    hasColorSelection && selectedColor ? `Color: ${selectedColor}` : null,
    hasSizeSelection && selectedSize ? `Size: ${selectedSize}` : null,
  ]
    .filter(Boolean)
    .join(" | ") || null;

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("coupons")
        .select("code, description");
      setCoupons(data || []);
    })();
  }, []);

  if (loading)
    return (
      <div className="container mx-auto px-4 py-20 space-y-4">
        <Skeleton className="h-10 max-w-md mx-auto rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Skeleton className="h-96 rounded-[30px]" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/5 rounded-xl" />
            <Skeleton className="h-8 w-2/4 rounded-xl" />
            <Skeleton className="h-10 rounded-xl" />
            <Skeleton className="h-40 rounded-3xl" />
          </div>
        </div>
      </div>
    );

  if (!product)
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Product not found</h1>
        <Link
          to="/shop"
          className="primary-btn px-6 py-3 inline-block mt-4 text-sm"
        >
          Browse Shop
        </Link>
      </div>
    );

  const wishlisted = isInWishlist(product.id);
  const related = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);
  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;
  const stockCount = product.stockCount ?? 0;
  const isOOS = product.stock === "out-of-stock";

  const copyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    toast.success(`Coupon ${code} copied!`);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <>
      <SEO
        title={`Buy ${product.name} at Best Price in Bangladesh — Luxynex`}
        description={`${product.name} available at Luxynex for ৳${product.price}. Fast delivery across Bangladesh.`}
        image={gallery[0]}
        url={`/product/${product.id}`}
        type="product"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.name,
          image: gallery,
          description: (product.description || "")
            .replace(/<[^>]+>/g, " ")
            .slice(0, 300),
          sku: product.sku || product.id,
          brand: { "@type": "Brand", name: "Luxynex" },
          offers: {
            "@type": "Offer",
            url: `https://luxynex.lovable.app/product/${product.id}`,
            priceCurrency: "BDT",
            price: product.price,
            availability: isOOS
              ? "https://schema.org/OutOfStock"
              : "https://schema.org/InStock",
          },
        }}
      />
      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-6 flex-wrap">
          <Link to="/" className="hover:text-primary">
            Home
          </Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/shop" className="hover:text-primary">
            Shop
          </Link>
          <ChevronRight className="w-3 h-3" />
          <Link
            to={`/shop?cat=${product?.category ?? ""}`}
            className="hover:text-primary capitalize"
          >
            {product?.subcategory || product?.category}
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground line-clamp-1">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-3"
          >
            <div className="light-card overflow-hidden rounded-2xl relative">
              <img
                key={activeImage}
                src={gallery[activeImage]}
                alt={product.name}
                className="w-full aspect-square object-cover hover:scale-105 transition-transform duration-500"
              />
              {discount > 0 && (
                <span className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                  -{discount}% OFF
                </span>
              )}
            </div>
            {gallery.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {gallery.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                      activeImage === i
                        ? "border-primary ring-2 ring-primary/30"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-5"
          >
            <div>
              <p className="text-sm text-primary font-semibold uppercase tracking-wide">
                {product.subcategory || product.category}
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mt-1">
                {product.name}
              </h1>
              {product.sku && (
                <p className="text-xs text-muted-foreground mt-1">
                  SKU: {product.sku}
                </p>
              )}
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < Math.floor(product.rating) ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                ({product.reviews} reviews)
              </span>
              <span
                className={`text-sm font-medium px-2 py-0.5 rounded-full ${
                  product.stock === "in-stock"
                    ? "bg-green-100 text-green-700"
                    : product.stock === "limited"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-red-100 text-red-700"
                }`}
              >
                {product.stock === "in-stock"
                  ? `In Stock${stockCount ? ` (${stockCount})` : ""}`
                  : product.stock === "limited"
                    ? `Limited (${stockCount} left)`
                    : "Out of Stock"}
              </span>
            </div>

            <div className="flex items-end gap-3 flex-wrap">
              <span className="text-3xl font-bold text-primary">
                ৳{product.price}
              </span>
              {product.originalPrice && (
                <span className="text-lg text-muted-foreground line-through mb-1">
                  ৳{product.originalPrice}
                </span>
              )}
              {discount > 0 && (
                <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs font-bold mb-1">
                  Save ৳{(product.originalPrice! - product.price).toFixed(0)}
                </span>
              )}
            </div>

            {/* Variants */}
            <motion.div
              animate={shakeVariants ? { x: [0, -8, 8, -6, 6, 0] } : { x: 0 }}
              transition={{ duration: 0.35 }}
              className="space-y-5"
            >
              {productColors.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">
                    Color:{" "}
                    <span className="text-muted-foreground">
                      {selectedColor || "Select"}
                    </span>
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {productColors.map((c, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedColor(c)}
                        className={`w-9 h-9 rounded-full border-2 transition-all ${selectedColor === c ? "border-primary ring-2 ring-primary/30 scale-110" : "border-border hover:border-primary"}`}
                        style={{ backgroundColor: c }}
                        title={c}
                        type="button"
                      />
                    ))}
                  </div>
                </div>
              )}

              {productSizes.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">
                    Size:{" "}
                    <span className="text-muted-foreground">
                      {selectedSize || "Select"}
                    </span>
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {productSizes.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedSize(s)}
                        className={`min-w-[44px] px-3 h-10 rounded-xl border-2 text-sm font-medium transition-all ${
                          selectedSize === s
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border hover:border-primary"
                        }`}
                        type="button"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Quantity */}
            <div>
              <p className="text-sm font-medium mb-2">Quantity</p>
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-muted rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="w-10 h-10 flex items-center justify-center hover:bg-primary/10 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-semibold">{qty}</span>
                  <button
                    onClick={() => setQty(qty + 1)}
                    className="w-10 h-10 flex items-center justify-center hover:bg-primary/10 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {stockCount > 0 && (
                  <span className="text-xs text-muted-foreground">
                    Max: {stockCount}
                  </span>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => {
                  if (isOOS) return;

                  if (!isVariantSelectionComplete) {
                    setShakeVariants(true);
                    toast.error(
                      "Please select your preferred size and variant options before adding to cart!",
                    );
                    setTimeout(() => setShakeVariants(false), 360);
                    return;
                  }

                  addToCart(product, qty, selectedVariantLabel);
                  toast.success("Added to cart!");
                }}
                disabled={isOOS}
                className="min-w-0 flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-black px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-900 disabled:opacity-50 disabled:pointer-events-none"
              >
                <ShoppingCart className="w-4 h-4" /> Add to Cart
              </button>
              <button
                type="button"
                onClick={() => {
                  if (isOOS) return;
                  if (!user) {
                    toast("Please sign in to complete checkout.");
                    navigate("/signin", { state: { from: "/checkout" } });
                    return;
                  }
                  if (!isVariantSelectionComplete) {
                    setShakeVariants(true);
                    toast.error(
                      "Please select your preferred size and variant options before adding to cart!",
                    );
                    setTimeout(() => setShakeVariants(false), 360);
                    return;
                  }
                  clearCart();
                  addToCart(product, qty, selectedVariantLabel);
                  toast.success("Proceeding to checkout!");
                  navigate("/checkout");
                }}
                disabled={isOOS}
                className="min-w-0 flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-black px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-900 disabled:opacity-50 disabled:pointer-events-none"
              >
                Buy Now
              </button>
              <button
                type="button"
                onClick={() => {
                  if (wishlisted) {
                    removeFromWishlist(product.id);
                    toast.success("Removed");
                  } else {
                    addToWishlist(product);
                    toast.success("Added to wishlist");
                  }
                }}
                className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted hover:bg-primary/10 transition-colors"
                aria-label="Wishlist"
              >
                <Heart
                  className={`w-5 h-5 ${wishlisted ? "fill-red-500 text-red-500" : "text-foreground"}`}
                />
              </button>
            </div>

            {/* Coupons */}
            {coupons.length > 0 && (
              <div className="light-card rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Tag className="w-4 h-4 text-primary" /> Available Coupons
                </div>
                <div className="space-y-2">
                  {coupons.map((c) => (
                    <div
                      key={c.code}
                      className="flex items-center justify-between gap-3 border border-dashed border-primary/40 rounded-xl px-3 py-2 bg-primary/5"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-primary">
                          {c.code}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {c.description}
                        </p>
                      </div>
                      <button
                        onClick={() => copyCoupon(c.code)}
                        className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 shrink-0"
                      >
                        {copied === c.code ? (
                          <>
                            <Check className="w-3 h-3" /> Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" /> Copy
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-2 pt-2">
              <div className="flex flex-col items-center text-center gap-1 p-3 rounded-xl bg-muted/50">
                <Truck className="w-5 h-5 text-primary" />
                <p className="text-xs font-medium">Free Delivery</p>
              </div>
              <div className="flex flex-col items-center text-center gap-1 p-3 rounded-xl bg-muted/50">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <p className="text-xs font-medium">Genuine Product</p>
              </div>
              <div className="flex flex-col items-center text-center gap-1 p-3 rounded-xl bg-muted/50">
                <RefreshCw className="w-5 h-5 text-primary" />
                <p className="text-xs font-medium">Easy Exchange</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tabbed details */}
        <section className="light-card rounded-2xl overflow-hidden mb-12">
          <div className="flex border-b border-border overflow-x-auto">
            {(
              [
                { key: "description", label: "Description", icon: Info },
                { key: "specs", label: "Features & Specs", icon: ShieldCheck },
                { key: "exchange", label: "Exchange Policy", icon: RefreshCw },
                { key: "notice", label: "Notice", icon: Info },
              ] as const
            ).map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                  tab === t.key
                    ? "border-primary text-primary bg-primary/5"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <t.icon className="w-4 h-4" /> {t.label}
              </button>
            ))}
          </div>
          <div className="p-6 text-sm text-muted-foreground leading-relaxed">
            {tab === "description" && (
              <div
                className="prose prose-sm max-w-none text-foreground
                  prose-headings:text-foreground prose-headings:font-bold prose-headings:mt-4 prose-headings:mb-2
                  prose-h2:text-lg prose-h3:text-base
                  prose-p:my-2 prose-p:leading-relaxed
                  prose-ul:my-2 prose-ul:pl-5 prose-ul:list-disc
                  prose-ol:my-2 prose-ol:pl-5 prose-ol:list-decimal
                  prose-li:my-1
                  prose-strong:text-foreground prose-strong:font-semibold
                  prose-a:text-primary hover:prose-a:underline"
                dangerouslySetInnerHTML={{
                  __html:
                    product.description ||
                    "<p>No description available for this product.</p>",
                }}
              />
            )}
            {tab === "specs" && (
              <ul className="space-y-2">
                <li className="flex justify-between border-b border-border pb-2">
                  <span className="font-medium text-foreground">Category</span>
                  <span className="capitalize">
                    {product.subcategory || product.category}
                  </span>
                </li>
                {product.sku && (
                  <li className="flex justify-between border-b border-border pb-2">
                    <span className="font-medium text-foreground">SKU</span>
                    <span>{product.sku}</span>
                  </li>
                )}
                {productColors.length > 0 && (
                  <li className="flex justify-between border-b border-border pb-2">
                    <span className="font-medium text-foreground">
                      Available Colors
                    </span>
                    <span>{productColors.length}</span>
                  </li>
                )}
                {productSizes.length > 0 && (
                  <li className="flex justify-between border-b border-border pb-2">
                    <span className="font-medium text-foreground">Sizes</span>
                    <span>{productSizes.join(", ")}</span>
                  </li>
                )}
                <li className="flex justify-between">
                  <span className="font-medium text-foreground">Stock</span>
                  <span>{stockCount} units</span>
                </li>
              </ul>
            )}
            {tab === "exchange" && (
              <div className="space-y-2">
                <p>
                  • 7-day easy exchange on unused, original-packaging items.
                </p>
                <p>• Manufacturing defects covered under warranty.</p>
                <p>
                  • Customer covers return shipping unless the item is
                  defective.
                </p>
                <p>
                  • Refunds issued within 5–7 business days after inspection.
                </p>
              </div>
            )}
            {tab === "notice" && (
              <div className="space-y-2">
                <p>
                  • Actual product color may vary slightly due to lighting and
                  screens.
                </p>
                <p>• Cash on Delivery available across Bangladesh.</p>
                <p>• Standard delivery: 2–5 business days. Free above ৳1000.</p>
                <p>
                  • For support, contact us via the Track Order or Contact page.
                </p>
              </div>
            )}
          </div>
        </section>

        {related.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-6">
              Related Products
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
      <WhatsAppFloat />
    </>
  );
}
