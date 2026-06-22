import { useState, useEffect } from "react";
import {
  Search,
  Package,
  CheckCircle,
  Truck,
  MapPin,
  Clock,
} from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";

const statusSteps = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
];
const stepLabels: Record<string, string> = {
  pending: "Order Placed",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
};
const stepIcons = [Package, CheckCircle, Package, Truck, CheckCircle];

export default function TrackOrder() {
  const [searchParams] = useSearchParams();
  const [orderId, setOrderId] = useState(searchParams.get("order") || "");
  const [phone, setPhone] = useState("");
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get("order") && searchParams.get("phone")) {
      setPhone(searchParams.get("phone") || "");
      // Defer to allow state to set
      setTimeout(handleTrack, 0);
    }
  }, []);

  const handleTrack = async () => {
    const oid = (orderId || searchParams.get("order") || "")
      .trim()
      .toUpperCase();
    const ph = (phone || searchParams.get("phone") || "").trim();
    if (!oid || !ph) {
      toast.error("Enter both Order ID and phone number");
      return;
    }
    setLoading(true);

    const { data, error } = await (supabase.rpc as any)("get_order_tracking", {
      p_order_number: oid,
      p_phone: ph,
    });

    const row = Array.isArray(data) ? data[0] : null;
    if (error || !row) {
      toast.error("Order not found");
      setOrder(null);
    } else {
      setOrder(row);
    }
    setLoading(false);
  };

  const currentStep = order ? statusSteps.indexOf(order.status) : -1;

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-6 max-w-2xl">
        <h1 className="text-2xl font-bold text-foreground mb-6 text-center">
          Track Your Order
        </h1>

        <div className="light-card p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="Order ID (e.g. LXV-12345)"
              className="flex-1 bg-muted rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40"
            />
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone Number"
              className="flex-1 bg-muted rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40"
            />
            <button
              onClick={handleTrack}
              disabled={loading}
              className="primary-btn px-6 py-2.5 text-sm flex items-center gap-2"
            >
              <Search className="w-4 h-4" />{" "}
              {loading ? "Searching..." : "Track"}
            </button>
          </div>
        </div>

        {order && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="light-card p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm text-muted-foreground">Order ID</p>
                <p className="font-semibold text-foreground">
                  {order.order_number}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="font-semibold text-primary">৳{order.total}</p>
              </div>
            </div>

            <div className="mb-4 p-3 rounded-xl bg-muted/50 text-sm space-y-1">
              <p>
                <span className="text-muted-foreground">Customer:</span>{" "}
                {order.customer_name}
              </p>
              <p>
                <span className="text-muted-foreground">Payment:</span>{" "}
                {order.payment_method.toUpperCase()} ({order.payment_status})
              </p>
            </div>

            {order.status === "cancelled" ? (
              <div className="p-4 rounded-xl bg-destructive/10 text-destructive font-medium text-center">
                Order Cancelled
              </div>
            ) : (
              <div className="space-y-0">
                {statusSteps.map((step, i) => {
                  const active = i <= currentStep;
                  const Icon = stepIcons[i];
                  return (
                    <div key={step} className="flex items-start gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        {i < statusSteps.length - 1 && (
                          <div
                            className={`w-0.5 h-8 ${i < currentStep ? "bg-primary" : "bg-border"}`}
                          />
                        )}
                      </div>
                      <div className="pb-6">
                        <p
                          className={`text-sm font-medium ${active ? "text-foreground" : "text-muted-foreground"}`}
                        >
                          {stepLabels[step]}
                        </p>
                        {active && i === currentStep && (
                          <p className="text-xs text-primary mt-0.5">
                            Current status
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </main>
    </div>
  );
}
