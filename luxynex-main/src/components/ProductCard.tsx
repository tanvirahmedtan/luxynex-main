import { Link } from "react-router-dom";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { Product } from "@/data/products";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { motion } from "framer-motion";
import { toast } from "sonner";

const badgeStyles = {
  new: "bg-blue-100 text-blue-700",
  hot: "bg-red-100 text-red-600",
  sale: "bg-green-100 text-green-700",
};

const stockStyles = {
  "in-stock": "text-green-600",
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
      className="light-card-hover group overflow-hidden"
    >
      <div className="relative overflow-hidden">
        <Link to={`/product/${product.id}`}>
          <img
            src={product.image}
            alt={product.name}
            className="w-full aspect-square object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        </Link>
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.badge && (
            <span
              className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${badgeStyles[product.badge]}`}
            >
              {product.badge}
            </span>
          )}
          {discount > 0 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
              -{discount}%
            </span>
          )}
        </div>
        {/* Wishlist */}
        <button
          type="button"
          onClick={() => {
            if (wishlisted) {
              removeFromWishlist(product.id);
              toast.info("Removed from wishlist");
            } else {
              addToWishlist(product);
              toast.success("Added to wishlist");
            }
          }}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-background/80 backdrop-blur flex items-center justify-center transition-colors hover:bg-primary/10"
        >
          <Heart
            className={`w-4 h-4 ${wishlisted ? "fill-red-500 text-red-500" : "text-muted-foreground"}`}
          />
        </button>
        {/* Quick Add */}
        <button
          type="button"
          onClick={() => {
            addToCart(product);
            toast.success(`${product.name} added to cart`);
          }}
          disabled={product.stock === "out-of-stock"}
          className="absolute bottom-0 left-0 right-0 bg-primary text-primary-foreground py-2.5 text-sm font-semibold translate-y-full group-hover:translate-y-0 transition-transform duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <ShoppingCart className="w-4 h-4" /> Add to Cart
        </button>
      </div>
      <Link to={`/product/${product.id}`} className="block p-3">
        <p className="text-xs text-muted-foreground mb-1">
          {product.subcategory}
        </p>
        <h3 className="text-sm font-medium text-foreground truncate mb-1">
          {product.name}
        </h3>
        <div className="flex items-center gap-1 mb-2">
          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
          <span className="text-xs text-muted-foreground">
            {product.rating} ({product.reviews})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold text-primary">৳{product.price}</span>
          {product.originalPrice && (
            <span className="text-xs text-muted-foreground line-through">
              ৳{product.originalPrice}
            </span>
          )}
        </div>
        <p
          className={`text-[10px] mt-1 font-medium ${stockStyles[product.stock]}`}
        >
          {stockLabels[product.stock]}
        </p>
      </Link>
    </motion.div>
  );
}
