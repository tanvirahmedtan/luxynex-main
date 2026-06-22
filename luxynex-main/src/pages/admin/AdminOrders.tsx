import { useEffect, useMemo, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  BadgeCheck,
  Copy,
  Eye,
  ImageOff,
  Package,
  Trash2,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type Order = Tables<"admin_orders">;
type PaymentStatus = "Unpaid" | "Pending Verification" | "Paid";

type OrderItem = {
  name: string;
  price: number;
  quantity: number;
  image?: string;
  color?: string;
  size?: string;
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  processing: "bg-purple-100 text-purple-800",
  shipped: "bg-cyan-100 text-cyan-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const PAYMENT_STATUS_COLORS: Record<PaymentStatus, string> = {
  Unpaid: "bg-slate-100 text-slate-800 border-slate-200",
  "Pending Verification": "bg-amber-100 text-amber-900 border-amber-200",
  Paid: "bg-emerald-600 text-white border-emerald-600",
};

const STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;

const PAYMENT_STATUSES: PaymentStatus[] = [
  "Unpaid",
  "Pending Verification",
  "Paid",
];

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selected, setSelected] = useState<Order | null>(null);
  const [savingPaymentStatus, setSavingPaymentStatus] = useState(false);

  const fetchOrders = async () => {
    const { data } = await supabase
      .from("admin_orders")
      .select("*")
      .order("created_at", { ascending: false });
    setOrders(data || []);
  };

  useEffect(() => {
    fetchOrders();
    const ch = supabase
      .channel(`admin_orders_${Math.random().toString(36).slice(2)}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "admin_orders" },
        () => fetchOrders(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("admin_orders")
      .update({ status: status as Order["status"] })
      .eq("id", id);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success(`Order status updated to ${status}`);
    fetchOrders();
  };

  const deleteOrder = async (id: string) => {
    if (!confirm("Delete this order? This cannot be undone.")) return;
    const { error } = await supabase.from("admin_orders").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Order deleted");
    setSelected(null);
    fetchOrders();
  };

  const parseOrderItems = (rawItems: unknown): unknown[] => {
    if (Array.isArray(rawItems)) return rawItems;
    if (typeof rawItems === "string") {
      try {
        const parsed = JSON.parse(rawItems);
        return Array.isArray(parsed)
          ? parsed
          : parsed && typeof parsed === "object" && Array.isArray((parsed as any).items)
          ? (parsed as any).items
          : [];
      } catch {
        return [];
      }
    }

    if (rawItems && typeof rawItems === "object") {
      const obj = rawItems as Record<string, unknown>;
      if (Array.isArray(obj.items)) return obj.items;
      if (Array.isArray(obj.cart_items)) return obj.cart_items;
    }

    return [];
  };

  const selectedItems = useMemo<OrderItem[]>(() => {
    if (!selected) return [];
    const raw = (selected as any).items ?? (selected as any).cart_items ??
      ((selected as any).payment_details as any)?.cart_items ?? [];
    const items = parseOrderItems(raw);

    return items.map((item) => {
      const record = item as Record<string, unknown>;
      return {
        name: typeof record.name === "string" ? record.name : "Unnamed item",
        price: Number(record.price ?? record.unit_price ?? 0),
        quantity: Number(record.quantity ?? record.qty ?? 0),
        image: typeof record.image === "string" ? record.image : undefined,
        color:
          typeof record.color === "string"
            ? record.color
            : typeof record.selected_color === "string"
              ? record.selected_color
              : typeof record.variant_color === "string"
                ? record.variant_color
                : undefined,
        size:
          typeof record.size === "string"
            ? record.size
            : typeof record.selected_size === "string"
              ? record.selected_size
              : typeof record.variant_size === "string"
                ? record.variant_size
                : undefined,
      };
    });
  }, [selected]);

  const selectedPaymentMethodLabel =
    selected?.payment_method === "bkash"
      ? "bKash"
      : selected?.payment_method === "nagad"
        ? "Nagad"
        : "Cash on Delivery";

  const selectedPaymentStatus =
    (selected?.payment_status as PaymentStatus | null) || "Unpaid";

  const selectedSenderNumber =
    selected?.sender_number ||
    (selected?.payment_details && typeof selected.payment_details === "object" && !Array.isArray(selected.payment_details)
      ? (selected.payment_details as Record<string, unknown>).sender_number
      : null) ||
    "—";

  const selectedTransactionId =
    selected?.transaction_id ||
    (selected?.payment_details && typeof selected.payment_details === "object" && !Array.isArray(selected.payment_details)
      ? (selected.payment_details as Record<string, unknown>).transaction_id
      : null) ||
    "—";

  const copyTransactionId = async () => {
    if (!selectedTransactionId || selectedTransactionId === "—") return;
    await navigator.clipboard.writeText(String(selectedTransactionId));
    toast.success("Transaction ID copied");
  };

  const updatePaymentStatus = async (paymentStatus: PaymentStatus) => {
    if (!selected) return;

    setSavingPaymentStatus(true);
    const { error } = await supabase
      .from("admin_orders")
      .update({ payment_status: paymentStatus })
      .eq("id", selected.id);

    if (error) {
      toast.error(error.message);
      setSavingPaymentStatus(false);
      return;
    }

    toast.success(`Payment status updated to ${paymentStatus}`);
    setSelected((current) =>
      current ? { ...current, payment_status: paymentStatus } : current,
    );
    setSavingPaymentStatus(false);
    fetchOrders();
  };

  const markPaidAndApprove = async () => {
    await updatePaymentStatus("Paid");
  };

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Orders</h1>
            <p className="text-sm text-muted-foreground">
              Review payment proof, item variants, and payment status.
            </p>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Payment Status</TableHead>
                    <TableHead>Order Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={9}
                        className="py-8 text-center text-muted-foreground"
                      >
                        No orders yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    orders.map((o) => (
                      <TableRow key={o.id}>
                        <TableCell className="font-mono text-xs">
                          {o.order_number}
                        </TableCell>
                        <TableCell className="font-medium">
                          {o.customer_name}
                        </TableCell>
                        <TableCell>{o.customer_phone}</TableCell>
                        <TableCell>৳{Number(o.total).toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="uppercase text-xs">
                            {o.payment_method === "bkash"
                              ? "bKash"
                              : o.payment_method === "nagad"
                                ? "Nagad"
                                : "Cash on Delivery"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={PAYMENT_STATUS_COLORS[(o.payment_status as PaymentStatus) ?? "Unpaid"]}>
                            {(o.payment_status as PaymentStatus) ?? "Unpaid"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={o.status}
                            onValueChange={(v) => updateStatus(o.id, v)}
                          >
                            <SelectTrigger
                              className={`h-8 w-32 rounded-full text-xs font-medium ${STATUS_COLORS[o.status] || ""}`}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {STATUSES.map((s) => (
                                <SelectItem key={s} value={s} className="capitalize">
                                  {s}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(o.created_at).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => setSelected(o)}
                              title="View details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => deleteOrder(o.id)}
                              title="Delete"
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto border-slate-800 bg-slate-950 text-slate-100 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl text-white">
              Order {selected?.order_number}
            </DialogTitle>
          </DialogHeader>

          {selected && (
            <div className="space-y-6">
              <div className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <div className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-300">
                    <Wallet className="h-4 w-4" /> Payment Proof
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-white/10 bg-slate-900/70 p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-400">
                        Payment Method Selected
                      </p>
                      <p className="mt-1 text-lg font-semibold text-white">
                        {selectedPaymentMethodLabel}
                      </p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-slate-900/70 p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-400">
                        Current Payment Status
                      </p>
                      <Select
                        value={selectedPaymentStatus}
                        onValueChange={(value) =>
                          updatePaymentStatus(value as PaymentStatus)
                        }
                        disabled={savingPaymentStatus}
                      >
                        <SelectTrigger className="mt-2 h-10 border-white/10 bg-slate-950 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PAYMENT_STATUSES.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-slate-900/70 p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-400">
                        Customer's Account Number
                      </p>
                      <p className="mt-1 break-all text-lg font-semibold text-white">
                        {selectedSenderNumber}
                      </p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-slate-900/70 p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-400">
                        Verification Code (TrxID)
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <p className="break-all font-semibold text-white">
                          {selectedTransactionId}
                        </p>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={copyTransactionId}
                          className="border-white/10 bg-white/5 text-white hover:bg-white/10"
                        >
                          <Copy className="mr-2 h-4 w-4" /> Copy
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Badge
                      variant="outline"
                      className={`border ${PAYMENT_STATUS_COLORS[selectedPaymentStatus]}`}
                    >
                      {selectedPaymentStatus}
                    </Badge>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <div className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-300">
                    <Package className="h-4 w-4" /> Order Details
                  </div>
                  <div className="space-y-3 text-sm text-slate-200">
                    <div>
                      <span className="text-slate-400">Customer:</span>{" "}
                      <strong>{selected.customer_name}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400">Phone:</span>{" "}
                      <strong>{selected.customer_phone}</strong>
                    </div>
                    {selected.customer_email && (
                      <div>
                        <span className="text-slate-400">Email:</span>{" "}
                        {selected.customer_email}
                      </div>
                    )}
                    <div>
                      <span className="text-slate-400">Address:</span>{" "}
                      {selected.shipping_address}
                    </div>
                    <div>
                      <span className="text-slate-400">Order Status:</span>{" "}
                      <Badge className={STATUS_COLORS[selected.status]}>
                        {selected.status}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-slate-400">Date:</span>{" "}
                      {new Date(selected.created_at).toLocaleString()}
                    </div>
                    {selected.notes && (
                      <div className="rounded-xl border border-white/10 bg-slate-900/70 p-4 text-slate-200">
                        <span className="text-slate-400">Note:</span>{" "}
                        {selected.notes}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <h4 className="mb-4 text-lg font-semibold text-white">Purchased Items</h4>
                <div className="space-y-3">
                  {selectedItems.length === 0 ? (
                    <div className="rounded-xl border border-white/10 bg-slate-900/70 p-4 text-sm text-slate-300">
                      No item data found in this order.
                    </div>
                  ) : (
                    selectedItems.map((item, index) => (
                      <div
                        key={`${item.name}-${index}`}
                        className="flex gap-3 rounded-xl border border-white/10 bg-slate-900/70 p-3"
                      >
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-slate-950">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <ImageOff className="h-5 w-5 text-slate-500" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-semibold text-white">{item.name}</p>
                              <div className="mt-1 flex flex-wrap gap-2 text-xs text-slate-300">
                                <span>Qty: {item.quantity}</span>
                                {item.color && <span>Color: {item.color}</span>}
                                {item.size && <span>Size: {item.size}</span>}
                              </div>
                            </div>
                            <p className="font-semibold text-white">
                              ৳{(item.price * item.quantity).toLocaleString()}
                            </p>
                          </div>
                          <p className="mt-1 text-xs text-slate-400">
                            ৳{Number(item.price).toLocaleString()} each
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 sm:grid-cols-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">Subtotal</p>
                  <p className="mt-1 text-lg font-semibold text-white">
                    ৳{Number(selected.subtotal).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">Delivery</p>
                  <p className="mt-1 text-lg font-semibold text-white">
                    ৳{Number(selected.shipping_fee).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">Total</p>
                  <p className="mt-1 text-lg font-semibold text-emerald-400">
                    ৳{Number(selected.total).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  onClick={() => markPaidAndApprove()}
                  disabled={savingPaymentStatus}
                  className="gap-2 border-emerald-500/30 bg-emerald-500 text-white hover:bg-emerald-600 hover:text-white"
                >
                  <BadgeCheck className="h-4 w-4" />
                  {savingPaymentStatus ? "Updating..." : "Mark as Paid & Approve"}
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => deleteOrder(selected.id)}
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" /> Delete Order
                </Button>
                {selected.status !== "cancelled" && (
                  <Button
                    variant="outline"
                    onClick={() => updateStatus(selected.id, "cancelled")}
                    className="border-white/10 bg-white/5 text-white hover:bg-white/10"
                  >
                    Cancel Order
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
