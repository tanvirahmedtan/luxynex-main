import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Copy, Loader2, Smartphone } from "lucide-react";
import { type PayMethod } from "@/lib/orderPayment";

type PendingOrderPayload = {
  items: {
    product_id: string;
    quantity: number;
    price: number;
    name: string;
    selected_variant?: string | null;
    selected_color?: string | null;
    selected_size?: string | null;
    product_image?: string | null;
    sku?: string | null;
    subtotal?: number;
  }[];
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

type CheckoutPaymentState = {
  pendingOrder?: PendingOrderPayload;
  orderId?: string;
  orderNumber?: string;
} | null;

type ShippingDetails = {
  name: string;
  phone: string | null;
  email: string | null;
  address: string;
};

export default function CheckoutPayment() {
  const location = useLocation();
  const navigate = useNavigate();
  const [method, setMethod] = useState<PayMethod>("bkash");
  const [loading, setLoading] = useState(false);
  const [senderNumber, setSenderNumber] = useState("");
  const [transactionId, setTransactionId] = useState("");

  const state = location.state as CheckoutPaymentState;
  const pendingOrder = state?.pendingOrder ?? null;
  const existingOrderId = state?.orderId ?? null;
  const existingOrderNumber = state?.orderNumber ?? null;
  const shippingDetails: ShippingDetails | null = pendingOrder
    ? {
        name: pendingOrder.customer_name,
        phone: pendingOrder.customer_phone,
        email: pendingOrder.customer_email,
        address: pendingOrder.shipping_address,
      }
    : null;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (pendingOrder?.preferredPaymentMethod) {
      setMethod(pendingOrder.preferredPaymentMethod);
    }
  }, [pendingOrder]);

  const paymentLabel = method === "bkash" ? "bKash" : "Nagad";

  const officialNumber = "01988550270";
  const instruction = useMemo(
    () =>
      `Please Send Money or Cash Out to our official ${paymentLabel} Number: ${officialNumber} and enter your details below for verification.`,
    [paymentLabel],
  );

  const copyNumber = async () => {
    await navigator.clipboard.writeText(officialNumber);
    toast.success("Number copied");
  };

  const submitPayment = async () => {
    if (!pendingOrder) {
      toast.error("Missing checkout data. Please reopen the checkout page.");
      return;
    }

    if (!senderNumber.trim() || !transactionId.trim()) {
      toast.error("Sender number and TrxID are required");
      return;
    }

    setLoading(true);

    try {
      const uniqueOrderNumber = `LXV-${new Date()
        .toISOString()
        .slice(0, 10)
        .replace(/-/g, "")}-${Math.floor(1000 + Math.random() * 9000)}`;

      const insertPayload = {
        order_number: uniqueOrderNumber,
        customer_name: pendingOrder.customer_name,
        customer_phone: pendingOrder.customer_phone || "",
        customer_email: pendingOrder.customer_email,
        shipping_address: pendingOrder.shipping_address,
        subtotal: pendingOrder.subtotal,
        shipping_fee: pendingOrder.shipping_fee,
        discount: pendingOrder.discount,
        total: pendingOrder.total,
        notes: pendingOrder.notes,
        items: pendingOrder.items,
        payment_method: method,
        sender_number: senderNumber.trim(),
        transaction_id: transactionId.trim(),
        payment_status: "Pending Verification",
        status: "pending",
      };

      const { data, error } = existingOrderId
        ? await supabase
            .from("admin_orders")
            .update({
              payment_method: method,
              sender_number: senderNumber.trim(),
              transaction_id: transactionId.trim(),
              payment_status: "Pending Verification",
              status: "pending",
            })
            .eq("id", existingOrderId)
            .select("order_number")
            .maybeSingle()
        : await supabase
            .from("admin_orders")
            .insert([insertPayload])
            .select("order_number")
            .maybeSingle();

      if (error) {
        console.error("CheckoutPayment insert error:", error);
        toast.error("Unable to submit payment details. See console for details.");
        return;
      }

      if (!data?.order_number) {
        toast.error("Order creation failed. Please try again.");
        return;
      }

      toast.success("Payment details submitted successfully! Your order is being reviewed.");
      navigate(`/track-order?order=${encodeURIComponent(data.order_number || existingOrderNumber || "")}`, {
        replace: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-3xl px-4 py-10">
      <div className="light-card space-y-6 p-6 sm:p-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
            Payment Verification
          </p>
          <h1 className="mt-2 text-3xl font-bold text-foreground">
            Checkout Payment
          </h1>
          {!pendingOrder ? (
            <p className="mt-2 text-sm text-red-600">
              No checkout data was found. Please return to the checkout page and submit again.
            </p>
          ) : (
            <div className="mt-2 space-y-2 text-sm text-muted-foreground">
              <p>
                Customer: <span className="font-semibold text-foreground">{pendingOrder.customer_name}</span>
              </p>
              <p>
                Shipping Address: <span className="font-semibold text-foreground">{pendingOrder.shipping_address}</span>
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {(["bkash", "nagad"] as PayMethod[]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setMethod(item)}
              className={`rounded-2xl border px-4 py-4 text-left transition-all ${
                method === item
                  ? "border-primary bg-primary/10"
                  : "border-gray-200 bg-white"
              }`}
            >
              <div className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-primary" />
                <span className="text-sm font-semibold text-foreground">
                  {item === "bkash" ? "bKash" : "Nagad"}
                </span>
              </div>
            </button>
          ))}
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-foreground">
          {instruction}
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Official Number
            </p>
            <p className="text-lg font-bold text-foreground">{officialNumber}</p>
          </div>
          <button
            type="button"
            onClick={copyNumber}
            className="secondary-btn gap-2 px-4 py-2 text-sm"
          >
            <Copy className="h-4 w-4" /> Copy
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-foreground">
              Sender Mobile Number
            </label>
            <input
              value={senderNumber}
              onChange={(e) => setSenderNumber(e.target.value)}
              placeholder="01XXXXXXXXX"
              className="field-input"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-foreground">
              Transaction ID (TrxID)
            </label>
            <input
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              placeholder="Enter your TrxID"
              className="field-input"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={submitPayment}
          disabled={loading}
          className="primary-btn flex w-full items-center justify-center gap-2 py-3.5 text-base disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Payment Details"
          )}
        </button>

        <p className="text-xs text-muted-foreground">
          Your order will remain in Pending Verification until the payment is
          reviewed.
        </p>
      </div>
    </div>
  );
}
