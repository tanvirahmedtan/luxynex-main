import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  Check,
  CreditCard,
  Lock,
  MapPin,
  Receipt,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";

const INSIDE_DHAKA_FEE = 80;
const OUTSIDE_DHAKA_FEE = 120;

type DeliveryZone = "inside_dhaka" | "outside_dhaka";
type PaymentMethod = "cod" | "online" | "bkash";
type OnlinePaymentType = "full" | "shipping_only";

type CouponValidationResult = {
  is_valid?: boolean;
  final_discount_amount?: number | null;
  code?: string | null;
  message?: string | null;
};

type PlaceOrderResult = { id: string; order_number: string }[];

type PendingOrderItem = {
  product_id: string;
  quantity: number;
  price: number;
  name: string;
  selected_variant?: string | null;
};

type PendingOrderPayload = {
  items: PendingOrderItem[];
  customer_name: string;
  customer_phone: string | null;
  customer_email: string | null;
  shipping_address: string;
  subtotal: number;
  shipping_fee: number;
  discount: number;
  total: number;
  notes: string;
  preferredPaymentMethod?: "bkash" | "nagad";
};

type ValidateCouponResponse = {
  data: CouponValidationResult[] | null;
  error: any;
};

type PlaceOrderResponse = {
  data: PlaceOrderResult | null;
  error: any;
};

type CheckoutForm = {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  deliveryZone: DeliveryZone;
  payment: PaymentMethod;
  onlinePaymentType: OnlinePaymentType;
};

export default function CheckoutPage() {
  const {
    items,
    subtotal,
    discountAmount,
    appliedCoupon,
    clearCart,
    promoCode,
    setPromoCode,
    couponLoading,
    applyPromo,
  } = useCart();
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/signin", { state: { from: "/checkout" }, replace: true });
    }
  }, [authLoading, user, navigate]);

  const [form, setForm] = useState<CheckoutForm>({
    fullName: profile?.full_name || "",
    phone: profile?.phone || "",
    address: "",
    city: "",
    deliveryZone: "inside_dhaka",
    payment: "online",
    onlinePaymentType: "full",
  });
  const [loading, setLoading] = useState(false);
  const [trxId, setTrxId] = useState("");

  const deliveryFee =
    form.deliveryZone === "inside_dhaka" ? INSIDE_DHAKA_FEE : OUTSIDE_DHAKA_FEE;
  const total = subtotal - discountAmount + deliveryFee;
  const totalWeight = items.reduce((w, { quantity }) => w + quantity * 3, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullName = form.fullName.trim();
    const phone = form.phone.trim().replace(/\s+/g, "");
    const address = form.address.trim();
    const city = form.city.trim();

    if (!fullName || !phone || !address || !city) {
      toast.error("Please fill all required fields");
      return;
    }
    if (!/^(\+880|880|0)?1[3-9]\d{8}$/.test(phone)) {
      toast.error("Enter a valid Bangladeshi mobile number");
      return;
    }
    if (address.length < 5) {
      toast.error("Address looks too short");
      return;
    }
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    const normalizedPhone = phone.startsWith("+880")
      ? phone.slice(4)
      : phone.startsWith("880")
        ? phone.slice(3)
        : phone;

    let appliedDiscountAmount = discountAmount;
    let validatedPromoCode = appliedCoupon?.code || promoCode.trim().toUpperCase();

    if (validatedPromoCode) {
      const { data: couponData, error: couponError } = await (
        supabase.rpc as any
      )("validate_coupon_code", {
        p_code: validatedPromoCode,
        p_subtotal: subtotal,
      }) as ValidateCouponResponse;

      if (couponError) {
        toast.error(couponError.message);
        return;
      }

      const validation = Array.isArray(couponData)
        ? (couponData[0] as CouponValidationResult | null)
        : null;
      if (!validation?.is_valid) {
        toast.error(validation?.message || "Invalid coupon code");
        return;
      }

      appliedDiscountAmount = Number(validation.final_discount_amount || 0);
      validatedPromoCode = String(validation.code || validatedPromoCode).toUpperCase();
    }

    if (form.payment !== "cod") {
      const pendingOrder: PendingOrderPayload = {
        items: items.map((i) => ({
          product_id: i.product.id,
          quantity: i.quantity,
          price: i.product.price,
          name: i.product.name,
          selected_variant: i.selectedVariant ?? null,
        })),
        customer_name: fullName,
        customer_phone: normalizedPhone,
        customer_email: user?.email || null,
        shipping_address: `${address}, ${city}`,
        subtotal,
        shipping_fee: deliveryFee,
        discount: appliedDiscountAmount,
        total,
        notes: [
          validatedPromoCode ? `Coupon: ${validatedPromoCode}` : null,
          `Delivery Zone: ${form.deliveryZone === "inside_dhaka" ? "Inside Dhaka" : "Outside Dhaka"}`,
          form.onlinePaymentType === "shipping_only"
            ? `Amount due now: ৳${deliveryFee}`
            : null,
        ]
          .filter(Boolean)
          .join(" | "),
        preferredPaymentMethod:
          form.payment === "bkash" ? "bkash" : undefined,
      };

      navigate("/checkout/payment", {
        state: { pendingOrder },
      });
      return;
    }

    setLoading(true);

    const deliveryLabel =
      form.deliveryZone === "inside_dhaka" ? "Inside Dhaka" : "Outside Dhaka";
    const paymentLabel = "Cash on Delivery";

    const orderPayload = {
      p_customer_name: fullName,
      p_customer_phone: normalizedPhone,
      p_customer_email: user?.email || null,
      p_shipping_address: `${address}, ${city}`,
      p_items: items.map((i) => ({
        product_id: i.product.id,
        quantity: i.quantity,
        selected_variant: i.selectedVariant ?? null,
      })),
      p_shipping_fee: deliveryFee,
      p_promo_discount_percent:
        subtotal > 0 ? (appliedDiscountAmount / subtotal) * 100 : 0,
      p_payment_method: "cod",
      p_notes: [
        validatedPromoCode ? `Coupon: ${validatedPromoCode}` : null,
        `Delivery Zone: ${deliveryLabel}`,
        `Payment: ${paymentLabel}`,
      ]
        .filter(Boolean)
        .join(" | "),
    };

    const { data, error } = await (supabase.rpc as any)(
      "place_order",
      orderPayload,
    ) as PlaceOrderResponse;

    if (error || !data || !Array.isArray(data) || data.length === 0) {
      toast.error(error?.message || "Failed to place order. Please try again.");
      setLoading(false);
      return;
    }

    const createdOrder = data[0] as { id: string; order_number: string };
    const orderNumber = createdOrder.order_number;
    toast.success(`Order placed! Your order ID: ${orderNumber}`);
    clearCart();
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <main className="container mx-auto max-w-6xl px-4 py-6 md:py-8">
        <header className="mb-6 flex items-center gap-3">
          <Link
            to="/cart"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-foreground shadow-sm transition-colors hover:bg-gray-50"
            aria-label="Back to cart"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-foreground" />
            <h1 className="text-xl font-bold text-foreground md:text-2xl">
              Secure Checkout
            </h1>
          </div>
        </header>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px] lg:items-start"
        >
          {/* LEFT COLUMN */}
          <div className="space-y-5">
            {/* Cart Items */}
            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
              <header className="mb-4 flex items-center justify-between border-b border-gray-100 pb-4">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-foreground" />
                  <h2 className="text-base font-bold text-foreground">
                    Cart Items
                  </h2>
                </div>
                <span className="text-sm text-muted-foreground">
                  {items.length} item(s)
                </span>
              </header>

              <div className="space-y-4">
                {items.map(({ product: p, quantity }) => (
                  <div
                    key={p.id}
                    className="flex items-start gap-3 border-b border-gray-100 pb-4 last:border-0 last:pb-0"
                  >
                    <img
                      src={p.image}
                      alt={p.name}
                      className="h-14 w-14 shrink-0 rounded-lg border border-gray-100 object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {p.name}
                      </p>
                      <div className="mt-1.5 flex flex-wrap gap-2">
                        <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-muted-foreground">
                          Qty: {quantity}
                        </span>
                        {p.sizes && p.sizes.length > 0 && (
                          <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-muted-foreground">
                            SIZE: {p.sizes[0]}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="shrink-0 text-sm font-bold text-foreground">
                      ৳{(p.price * quantity).toFixed(1)}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* Address & Shipping */}
            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
              <header className="mb-5 flex items-center gap-2 border-b border-gray-100 pb-4">
                <MapPin className="h-5 w-5 text-foreground" />
                <h2 className="text-base font-bold text-foreground">
                  Address &amp; Shipping Details
                </h2>
              </header>

              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <DualLabelField
                    label="Full Name"
                    bengali="পূর্ণ নাম"
                    required
                  >
                    <input
                      required
                      value={form.fullName}
                      onChange={(e) =>
                        setForm({ ...form, fullName: e.target.value })
                      }
                      placeholder="Enter your full name"
                      className="field-input"
                    />
                  </DualLabelField>

                  <DualLabelField
                    label="Phone Number"
                    bengali="ফোন নম্বর"
                    required
                  >
                    <input
                      required
                      type="tel"
                      value={form.phone}
                      onChange={(e) =>
                        setForm({ ...form, phone: e.target.value })
                      }
                      placeholder="+880 1XXXXXXXXX"
                      className="field-input"
                    />
                  </DualLabelField>
                </div>

                <DualLabelField
                  label="Street Address"
                  bengali="ঠিকানা"
                  required
                >
                  <input
                    required
                    value={form.address}
                    onChange={(e) =>
                      setForm({ ...form, address: e.target.value })
                    }
                    placeholder="123, ABC Road, House #45"
                    className="field-input bg-sky-50/60"
                  />
                </DualLabelField>

                <DualLabelField label="City" bengali="শহর" required>
                  <input
                    required
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    placeholder="Enter your city"
                    className="field-input"
                  />
                </DualLabelField>

                <div>
                  <DualLabelField label="Delivery Zone" bengali="ডেলিভারি এলাকা">
                    <div className="mt-1 space-y-2">
                      <DeliveryZoneCard
                        selected={form.deliveryZone === "inside_dhaka"}
                        title="Inside Dhaka"
                        price={INSIDE_DHAKA_FEE}
                        onClick={() =>
                          setForm({ ...form, deliveryZone: "inside_dhaka" })
                        }
                      />
                      <DeliveryZoneCard
                        selected={form.deliveryZone === "outside_dhaka"}
                        title="Outside Dhaka"
                        price={OUTSIDE_DHAKA_FEE}
                        onClick={() =>
                          setForm({ ...form, deliveryZone: "outside_dhaka" })
                        }
                      />
                    </div>
                  </DualLabelField>
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN — Sticky Sidebar */}
          <aside className="space-y-5 lg:sticky lg:top-6">
            {/* Order Summary */}
            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
              <header className="mb-4 flex items-center gap-2 border-b border-gray-100 pb-4">
                <Receipt className="h-5 w-5 text-foreground" />
                <h2 className="text-base font-bold text-foreground">
                  Order Summary
                </h2>
              </header>

              <div className="space-y-2.5 text-sm">
                <SummaryRow label="Subtotal" value={`৳${subtotal.toFixed(1)}`} />
                <SummaryRow
                  label="Weight"
                  value={`${totalWeight} Grams`}
                />
                <SummaryRow
                  label="Shipping"
                  value={`৳${deliveryFee.toFixed(2)}`}
                />
                {discountAmount > 0 && (
                  <SummaryRow
                    label="Discount"
                    value={`-৳${discountAmount.toFixed(2)}`}
                    valueClassName="text-green-600"
                  />
                )}
              </div>

              <div className="mt-4 flex gap-2">
                <input
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Have a coupon code?"
                  className="field-input flex-1"
                />
                <button
                  type="button"
                  onClick={async () => {
                    const result = await applyPromo();
                    toast[result.ok ? "success" : "error"](result.message);
                  }}
                  disabled={couponLoading}
                  className="shrink-0 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-gray-100 disabled:opacity-60"
                >
                  {couponLoading ? "..." : "Apply"}
                </button>
              </div>

              <div className="mt-5 flex items-end justify-between border-t border-gray-100 pt-4">
                <div>
                  <p className="text-sm font-semibold text-foreground">Total</p>
                  <p className="text-[11px] text-muted-foreground">
                    VAT included
                  </p>
                </div>
                <span className="text-2xl font-bold text-foreground">
                  ৳{total.toFixed(2)}
                </span>
              </div>
            </section>

            {/* Payment Options */}
            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Payment Option
              </p>

              <div className="space-y-2.5">
                <PaymentOptionCard
                  selected={form.payment === "cod"}
                  onSelect={() => setForm({ ...form, payment: "cod" })}
                  icon={<Banknote className="h-5 w-5" />}
                  title="Cash on Delivery"
                  description="Pay securely when you receive"
                  price={`৳${total.toFixed(2)}`}
                />

                <PaymentOptionCard
                  selected={form.payment === "online"}
                  onSelect={() => setForm({ ...form, payment: "online" })}
                  icon={<CreditCard className="h-5 w-5" />}
                  title="Online Payment"
                  description="Pay securely with card or mobile bank"
                />

                {form.payment === "bkash" && (
                  <div className="ml-1 space-y-3 border-l-2 border-gray-100 pl-3 pt-1">
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-foreground shadow-sm">
                      <p className="font-semibold text-foreground">
                        Please Send Money or Cash Out to our official bKash Number: 01988550270 and enter your bKash Transaction ID (TrxID) below for verification.
                      </p>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-foreground">
                        bKash Transaction ID (TrxID)
                      </label>
                      <input
                        value={trxId}
                        onChange={(e) => setTrxId(e.target.value)}
                        placeholder="Enter your TrxID"
                        className="field-input"
                      />
                    </div>
                  </div>
                )}

                {form.payment === "online" && (
                  <div className="ml-1 space-y-2 border-l-2 border-gray-100 pl-3 pt-1">
                    <NestedPaymentOption
                      selected={form.onlinePaymentType === "full"}
                      onSelect={() =>
                        setForm({ ...form, onlinePaymentType: "full" })
                      }
                      title="Full Payment"
                      description="Pay the total amount now"
                      price={`৳${total.toFixed(2)}`}
                    />
                    <NestedPaymentOption
                      selected={form.onlinePaymentType === "shipping_only"}
                      onSelect={() =>
                        setForm({ ...form, onlinePaymentType: "shipping_only" })
                      }
                      title="Shipping Only"
                      description="Pay only the shipping fee now"
                      price={`৳${deliveryFee.toFixed(2)}`}
                    />
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="primary-btn mt-5 w-full gap-2 py-3.5 text-base disabled:opacity-60"
              >
                {loading ? "Placing Order..." : "Confirm Order"}
                {!loading && <ArrowRight className="h-5 w-5" />}
              </button>

              <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-green-600" />
                Secure Encrypted Checkout
              </p>
            </section>
          </aside>
        </form>
      </main>
    </div>
  );
}

function DualLabelField({
  label,
  bengali,
  required,
  children,
}: {
  label: string;
  bengali: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-foreground">
        {label}{" "}
        <span className="font-normal text-muted-foreground">({bengali})</span>
        {required && <span className="text-primary"> *</span>}
      </label>
      {children}
    </div>
  );
}

function DeliveryZoneCard({
  selected,
  title,
  price,
  onClick,
}: {
  selected: boolean;
  title: string;
  price: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-between rounded-xl border px-4 py-3.5 text-left transition-all ${
        selected
          ? "border-foreground/80 bg-[#FACC15] shadow-sm"
          : "border-gray-200 bg-white hover:border-gray-300"
      }`}
    >
      <div className="flex items-center gap-3">
        <span
          className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
            selected
              ? "border-foreground bg-foreground"
              : "border-gray-300 bg-white"
          }`}
        >
          {selected && <Check className="h-3 w-3 text-[#FACC15]" strokeWidth={3} />}
        </span>
        <span className="text-sm font-semibold text-foreground">{title}</span>
      </div>
      <span className="text-sm font-bold text-foreground">{price} BDT</span>
    </button>
  );
}

function SummaryRow({
  label,
  value,
  valueClassName = "",
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-medium text-foreground ${valueClassName}`}>
        {value}
      </span>
    </div>
  );
}

function PaymentOptionCard({
  selected,
  onSelect,
  icon,
  title,
  description,
  price,
}: {
  selected: boolean;
  onSelect: () => void;
  icon: React.ReactNode;
  title: string;
  description: string;
  price?: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition-all ${
        selected
          ? "border-primary/50 bg-primary/5 ring-1 ring-primary/20"
          : "border-gray-200 bg-white hover:border-gray-300"
      }`}
    >
      <span
        className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
          selected ? "border-primary bg-primary" : "border-gray-300"
        }`}
      >
        {selected && (
          <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        {price && (
          <span className="text-sm font-bold text-foreground">{price}</span>
        )}
        <span className="text-muted-foreground">{icon}</span>
      </div>
    </button>
  );
}

function NestedPaymentOption({
  selected,
  onSelect,
  title,
  description,
  price,
}: {
  selected: boolean;
  onSelect: () => void;
  title: string;
  description: string;
  price: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-all ${
        selected
          ? "border-primary/40 bg-primary/5"
          : "border-gray-100 bg-gray-50/50 hover:bg-gray-50"
      }`}
    >
      <span
        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
          selected ? "border-primary bg-primary" : "border-gray-300 bg-white"
        }`}
      >
        {selected && (
          <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-[11px] text-muted-foreground">{description}</p>
      </div>
      <span className="shrink-0 text-xs font-bold text-foreground">{price}</span>
    </button>
  );
}
