import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingBag, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function CartPage() {
  const {
    items: rawItems,
    updateQuantity,
    removeFromCart,
    clearCoupon,
    subtotal,
    promoCode,
    setPromoCode,
    discountAmount,
    couponLoading,
    applyPromo,
    hydrated,
  } = useCart();
  const items = rawItems ?? [];
  const { user } = useAuth();
  const navigate = useNavigate();
  const deliveryFee = subtotal >= 1000 ? 0 : 80;
  const total = subtotal - discountAmount + deliveryFee;

  if (!hydrated)
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-20 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground text-sm">
            Loading your cart…
          </span>
        </div>
      </div>
    );

  if (!items || items.length === 0)
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-20 text-center">
          <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
          <p className="text-muted-foreground mb-6">
            Add some amazing products to get started!
          </p>
          <Link
            to="/shop"
            className="primary-btn px-6 py-3 inline-block text-sm"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-foreground mb-6">
          Shopping Cart
        </h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            {items?.map(({ product: p, quantity, selectedVariant }) => {
              const productId = p?.id ?? "";
              const productName = p?.name ?? "Cart item";
              const productPrice = Number(p?.price ?? 0);
              const productQuantity = Number(quantity ?? 0);
              const normalizedVariant = selectedVariant ?? null;
              const itemKey = `${productId}-${normalizedVariant ?? "default"}-${productQuantity}`;

              return (
                <div
                  key={itemKey}
                  className="light-card p-4 flex gap-4 items-center"
                >
                  <img
                    src={p?.image ?? ""}
                    alt={productName}
                    className="w-20 h-20 rounded-xl object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <Link
                      to={productId ? `/product/${productId}` : "#"}
                      className="font-medium text-sm truncate block hover:text-primary"
                    >
                      {productName}
                    </Link>
                    {normalizedVariant ? (
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {normalizedVariant}
                      </p>
                    ) : null}
                    <p className="text-primary font-bold text-sm mt-1">
                      ৳{productPrice}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        if (productId) updateQuantity(productId, productQuantity - 1, normalizedVariant);
                      }}
                      className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center hover:bg-primary/10"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center text-sm font-medium">
                      {productQuantity}
                    </span>
                    <button
                      onClick={() => {
                        if (productId) updateQuantity(productId, productQuantity + 1, normalizedVariant);
                      }}
                      className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center hover:bg-primary/10"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="font-bold text-sm w-20 text-right">
                    ৳{productPrice * productQuantity}
                  </p>
                  <button
                    onClick={() => {
                      if (productId) {
                        removeFromCart(productId, normalizedVariant);
                        toast.info("Removed from cart");
                      }
                    }}
                    className="p-2 hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>

          <div className="light-card p-6 rounded-xl h-fit space-y-4">
            <h3 className="font-bold text-foreground">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>৳{subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery</span>
                <span>
                  {deliveryFee === 0 ? (
                    <span className="text-green-600 font-semibold">FREE</span>
                  ) : (
                    `৳${deliveryFee}`
                  )}
                </span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Discount
                  </span>
                  <span className="text-green-600">-৳{discountAmount}</span>
                </div>
              )}
            </div>
            <div className="border-t border-border pt-3 flex justify-between font-bold">
              <span>Total</span>
              <span className="text-primary text-lg">৳{total}</span>
            </div>
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Promo code"
                  className="flex-1 bg-muted rounded-xl px-3 py-2 text-sm outline-none"
                />
                <button
                  onClick={async () => {
                    const result = await applyPromo();
                    toast[result.ok ? "success" : "error"](result.message);
                  }}
                  disabled={couponLoading}
                  className="primary-btn px-4 py-2 text-xs disabled:opacity-60"
                >
                  {couponLoading ? "Checking..." : "Apply"}
                </button>
              </div>
              {discountAmount > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    clearCoupon();
                    toast.success("Coupon removed");
                  }}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-foreground hover:bg-gray-50"
                >
                  Remove coupon
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                if (!user) {
                  toast("Please sign in to continue to checkout.");
                  navigate("/signin", { state: { from: "/checkout" } });
                  return;
                }
                navigate("/checkout");
              }}
              className="primary-btn w-full py-3 text-sm block text-center"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
