import { Link } from "react-router-dom";
import { Heart, ShoppingCart } from "lucide-react";
import { Product } from "@/data/products";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { motion } from "framer-motion";
import { toast } from "sonner";

const stockStyles = {
  "in-stock": "text-emerald-600",
  limited: "text-amber-500",
  "out-of-stock": "text-destructive",
};

const stockLabels = {
  "in-stock": "In Stock",
  limited: "Limited Stock",
  "out-of-stock": "Out of Stock",
};

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const wishlisted = isInWishlist(product.id);
  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="font-sans overflow-hidden rounded-[16px] border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative overflow-hidden">
        <Link to={`/product/${product.id}`} className="block">
          <img
            src={product.image}
            alt={product.name}
            className="w-full aspect-square object-cover transition duration-500 hover:scale-105"
            loading="lazy"
          />
          <div className="px-3 pt-3 pb-2">
            <p className="text-[10px] uppercase tracking-[0.28em] text-slate-400 mb-1">
              {product.subcategory}
            </p>
            <h3 className="text-base font-semibold text-slate-950 leading-6 mb-1 truncate">
              {product.name}
            </h3>
            <div className="flex items-end gap-1.5">
              <p className="text-lg font-semibold text-orange-500">৳{product.price}</p>
              {product.originalPrice && (
                <p className="text-sm text-slate-400 line-through">৳{product.originalPrice}</p>
              )}
            </div>
            <div className="mt-1 flex items-center justify-between gap-2 text-sm text-slate-500">
              <span className={stockStyles[product.stock] ?? "text-slate-500"}>
                {stockLabels[product.stock]}
              </span>
              {product.rating > 0 && (
                <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                  ⭐ {product.rating.toFixed(1)}
                </span>
              )}
            </div>
          </div>
        </Link>

        {discount > 0 && (
          <span className="absolute right-4 top-4 z-10 rounded-full bg-emerald-500 px-3 py-1 text-[11px] font-semibold text-white shadow-sm">
            Save {discount}%
          </span>
        )}

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            if (wishlisted) {
              removeFromWishlist(product.id);
              toast.info("Removed from wishlist");
            } else {
              addToWishlist(product);
              toast.success("Added to wishlist");
            }
          }}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute left-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm text-slate-700 transition hover:bg-slate-50"
        >
          <Heart
            className={`w-4 h-4 ${wishlisted ? "fill-red-500 text-red-500" : "text-slate-700"}`}
          />
        </button>
      </div>

      <div className="px-3 pb-2 pt-2">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            addToCart(product);
            toast.success(`${product.name} added to cart`);
          }}
          disabled={product.stock === "out-of-stock"}
          className="flex w-full items-center justify-center gap-2 rounded-[14px] border border-orange-400 bg-white px-3 py-2 text-sm font-semibold text-orange-500 transition hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ShoppingCart className="w-4 h-4" /> Add to Cart
        </button>
      </div>
    </motion.div>
  );
}
