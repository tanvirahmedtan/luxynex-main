import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import type { Database } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/data/products";

type CouponRow = Database["public"]["Tables"]["coupons"]["Row"] & {
  expiry_date?: string | null;
  usage_limit?: number | null;
  usage_count?: number | null;
  used_count?: number | null;
  times_used?: number | null;
};

export interface CartItem {
  product: Product;
  quantity: number;
  selectedVariant?: string | null;
  selected_color?: string | null;
  selected_size?: string | null;
}

export type PromoResult = {
  ok: boolean;
  message: string;
  coupon?: CouponRow | null;
  discountAmount?: number;
};

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, qty?: number, selectedVariant?: string | null, selectedColor?: string | null, selectedSize?: string | null) => void;
  removeFromCart: (productId: string, selectedVariant?: string | null, selectedColor?: string | null, selectedSize?: string | null) => void;
  updateQuantity: (productId: string, qty: number, selectedVariant?: string | null, selectedColor?: string | null, selectedSize?: string | null) => void;
  clearCart: () => void;
  clearCoupon: () => void;
  totalItems: number;
  subtotal: number;
  promoCode: string;
  setPromoCode: (code: string) => void;
  appliedCoupon: CouponRow | null;
  discountAmount: number;
  couponLoading: boolean;
  applyPromo: () => Promise<PromoResult>;
  hydrated: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = "luxynex_cart_v1";

const normalizeCouponCode = (code: string) => code.trim().toUpperCase();

export const parseVariantSelection = (
  selectedVariant?: string | null,
  selectedColor?: string | null,
  selectedSize?: string | null,
) => {
  const normalizedVariant = selectedVariant?.trim() || null;
  const normalizedColor = selectedColor?.trim() || null;
  const normalizedSize = selectedSize?.trim() || null;

  const variantText = normalizedVariant ?? "";
  const colorFromVariant =
    normalizedColor ??
    variantText.match(/(?:^|[|,])\s*(?:color|colour)\s*:\s*([^|,]+)/i)?.[1]?.trim() ??
    null;
  const sizeFromVariant =
    normalizedSize ??
    variantText.match(/(?:^|[|,])\s*size\s*:\s*([^|,]+)/i)?.[1]?.trim() ??
    null;

  return {
    normalizedVariant,
    normalizedColor: normalizedColor ?? colorFromVariant ?? null,
    normalizedSize: normalizedSize ?? sizeFromVariant ?? null,
  };
};

const isCartItem = (value: unknown): value is CartItem => {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<CartItem>;
  return (
    typeof item.quantity === "number" &&
    item.quantity >= 0 &&
    item.product !== null &&
    typeof item.product === "object" &&
    typeof (item.product as Partial<Product>).id === "string" &&
    (item.selectedVariant === undefined ||
      item.selectedVariant === null ||
      typeof item.selectedVariant === "string") &&
    (item.selected_color === undefined ||
      item.selected_color === null ||
      typeof item.selected_color === "string") &&
    (item.selected_size === undefined ||
      item.selected_size === null ||
      typeof item.selected_size === "string")
  );
};

const normalizeStoredCartItem = (value: unknown): CartItem | null => {
  if (!value || typeof value !== "object") return null;
  const raw = value as CartItem & {
    selectedColor?: string | null;
    selectedSize?: string | null;
  };
  const { normalizedColor, normalizedSize } = parseVariantSelection(
    raw.selectedVariant,
    raw.selected_color ?? raw.selectedColor,
    raw.selected_size ?? raw.selectedSize,
  );
  const normalized = {
    ...raw,
    selected_color: normalizedColor,
    selected_size: normalizedSize,
  };
  return isCartItem(normalized) ? normalized : null;
};

const getUsageCount = (coupon: CouponRow) =>
  Number(
    coupon.usage_count ?? coupon.used_count ?? coupon.times_used ?? 0,
  );

const getCouponDiscountAmount = (coupon: CouponRow | null, subtotal: number) => {
  if (!coupon) return 0;
  const percent = Number(coupon.discount_percent || 0);
  if (percent > 0) return Math.round((subtotal * percent) / 100);
  const amount = Number(coupon.discount_amount || 0);
  return Math.min(amount, subtotal);
};

const validateCoupon = (coupon: CouponRow | null, subtotal: number) => {
  if (!coupon) {
    return { ok: false, message: "Invalid coupon code", discountAmount: 0 };
  }

  if (!coupon.is_active) {
    return { ok: false, message: "This coupon is inactive", discountAmount: 0 };
  }

  const minOrderAmount = Number(coupon.min_order_amount || 0);
  if (subtotal < minOrderAmount) {
    return {
      ok: false,
      message: `Minimum order for this coupon is ৳${minOrderAmount}`,
      discountAmount: 0,
    };
  }

  const expiryValue = coupon.expiry_date;
  if (expiryValue) {
    const expiryDate = new Date(expiryValue);
    if (!Number.isNaN(expiryDate.getTime()) && expiryDate.getTime() < Date.now()) {
      return {
        ok: false,
        message: "This coupon has expired",
        discountAmount: 0,
      };
    }
  }

  const usageLimit = coupon.usage_limit;
  if (usageLimit !== null && usageLimit !== undefined) {
    const usedCount = getUsageCount(coupon);
    if (usedCount >= Number(usageLimit)) {
      return {
        ok: false,
        message: "This coupon has reached its usage limit",
        discountAmount: 0,
      };
    }
  }

  const discountAmount = getCouponDiscountAmount(coupon, subtotal);
  if (discountAmount <= 0) {
    return {
      ok: false,
      message: "This coupon does not provide any discount",
      discountAmount: 0,
    };
  }

  return {
    ok: true,
    message: `Coupon ${coupon.code} applied successfully`,
    discountAmount,
  };
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [promoCode, setPromoCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<CouponRow | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage once on mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.items)) {
          setItems(parsed.items.map(normalizeStoredCartItem).filter((item): item is CartItem => item !== null));
        }
        if (typeof parsed.promoCode === "string") {
          setPromoCode(normalizeCouponCode(parsed.promoCode));
        }
        if (parsed.appliedCoupon && typeof parsed.appliedCoupon === "object") {
          setAppliedCoupon(parsed.appliedCoupon as CouponRow);
        }
      }
    } catch (e) {
      console.warn("Failed to restore cart from storage:", e);
    }
    setHydrated(true);
  }, []);

  // Persist after hydration.
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ items, promoCode, appliedCoupon }),
      );
    } catch (e) {
      console.warn("Failed to persist cart:", e);
    }
  }, [items, promoCode, appliedCoupon, hydrated]);

  const addToCart = useCallback(
    (product: Product, qty = 1, selectedVariant?: string | null, selectedColor?: string | null, selectedSize?: string | null) => {
      const { normalizedVariant, normalizedColor, normalizedSize } = parseVariantSelection(
        selectedVariant,
        selectedColor,
        selectedSize,
      );
      setItems((prev) => {
        const existingIndex = prev.findIndex(
          (i) =>
            i.product.id === product.id &&
            (i.selectedVariant || null) === normalizedVariant &&
            (i.selected_color || null) === normalizedColor &&
            (i.selected_size || null) === normalizedSize,
        );

        if (existingIndex > -1) {
          return prev.map((item, index) =>
            index === existingIndex
              ? { ...item, quantity: item.quantity + qty }
              : item,
          );
        }

        return [
          ...prev,
          {
            product,
            quantity: qty,
            selectedVariant: normalizedVariant,
            selected_color: normalizedColor,
            selected_size: normalizedSize,
          },
        ];
      });
    },
    [],
  );

  const removeFromCart = useCallback(
    (id: string, selectedVariant?: string | null, selectedColor?: string | null, selectedSize?: string | null) =>
      setItems((prev) => {
        const { normalizedVariant, normalizedColor, normalizedSize } = parseVariantSelection(
          selectedVariant,
          selectedColor,
          selectedSize,
        );
        return prev.filter(
          (i) =>
            i.product.id !== id ||
            (i.selectedVariant || null) !== normalizedVariant ||
            (i.selected_color || null) !== normalizedColor ||
            (i.selected_size || null) !== normalizedSize,
        );
      }),
    [],
  );
  const updateQuantity = useCallback(
    (id: string, qty: number, selectedVariant?: string | null, selectedColor?: string | null, selectedSize?: string | null) => {
      if (qty < 1) return;
      const { normalizedVariant, normalizedColor, normalizedSize } = parseVariantSelection(
        selectedVariant,
        selectedColor,
        selectedSize,
      );
      setItems((prev) =>
        prev.map((i) =>
          i.product.id === id &&
          (i.selectedVariant || null) === normalizedVariant &&
          (i.selected_color || null) === normalizedColor &&
          (i.selected_size || null) === normalizedSize
            ? { ...i, quantity: qty }
            : i,
        ),
      );
    },
    [],
  );
  const clearCart = useCallback(() => {
    setItems([]);
    setPromoCode("");
    setAppliedCoupon(null);
  }, []);

  const clearCoupon = useCallback(() => {
    setAppliedCoupon(null);
    setPromoCode("");
  }, []);

  const subtotal = items.reduce((sum, i) => {
    const price = Number(i?.product?.price ?? 0);
    const qty = Number(i?.quantity ?? 0);
    return sum + price * qty;
  }, 0);
  const totalItems = items.reduce((sum, i) => sum + (Number(i?.quantity ?? 0) || 0), 0);

  const discountAmount = getCouponDiscountAmount(appliedCoupon, subtotal);

  const applyPromo = useCallback(async (): Promise<PromoResult> => {
    const code = normalizeCouponCode(promoCode);
    if (!code) {
      setAppliedCoupon(null);
      return { ok: false, message: "Enter a coupon code", discountAmount: 0 };
    }

    if (appliedCoupon && appliedCoupon.code !== code) {
      return {
        ok: false,
        message: `Only one coupon can be applied at a time. Remove ${appliedCoupon.code} first.`,
        discountAmount: discountAmount,
      };
    }

    if (appliedCoupon && appliedCoupon.code === code) {
      return {
        ok: true,
        message: `Coupon ${code} is already applied`,
        coupon: appliedCoupon,
        discountAmount,
      };
    }

    setCouponLoading(true);
    try {
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .ilike("code", code)
        .eq("is_active", true)
        .maybeSingle();

      if (error) {
        setAppliedCoupon(null);
        return {
          ok: false,
          message: error.message,
          discountAmount: 0,
        };
      }

      const coupon = (data as CouponRow | null) ?? null;
      const result = validateCoupon(coupon, subtotal);
      if (!result.ok) {
        setAppliedCoupon(null);
        return result;
      }

      setPromoCode(code);
      setAppliedCoupon(coupon);
      return {
        ok: true,
        message: result.message,
        coupon,
        discountAmount: result.discountAmount,
      };
    } finally {
      setCouponLoading(false);
    }
  }, [promoCode, subtotal, appliedCoupon, discountAmount]);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        clearCoupon,
        totalItems,
        subtotal,
        promoCode,
        setPromoCode,
        appliedCoupon,
        discountAmount,
        couponLoading,
        applyPromo,
        hydrated,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
