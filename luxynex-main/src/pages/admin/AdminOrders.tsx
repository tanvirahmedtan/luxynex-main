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
  FileText,
  ImageOff,
  Package,
  Trash2,
  Wallet,
} from "lucide-react";
import jsPDF from "jspdf";
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
  sku?: string;
  variantInfo?: string;
  product_id?: string;
  subtotal?: number;
  selected_color?: string;
  selected_size?: string;
};

type InvoiceRpcRow = {
  invoice_html: string;
  invoice_filename?: string | null;
  order_number?: string | null;
  customer_name?: string | null;
  order_total?: number | null;
};

type InvoiceRpcResponse = {
  data?: InvoiceRpcRow[] | InvoiceRpcRow | null;
  error?: { message?: string } | null;
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

const formatInvoiceCurrency = (value: unknown) =>
  `BDT ${Number(value ?? 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const sanitizeDownloadName = (value: string) =>
  value.replace(/[\\/:*?"<>|]+/g, "-").replace(/\s+/g, "_");

const downloadBlob = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

const getInvoiceRow = (data: InvoiceRpcResponse["data"]) => {
  if (Array.isArray(data)) return data[0] ?? null;
  if (data && typeof data === "object") return data;
  return null;
};

const getCleanString = (value: unknown) => {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const parseVariantText = (value: unknown) => {
  const text = getCleanString(value);
  if (!text) return {};

  const colorMatch = text.match(/(?:^|[|,])\s*(?:color|colour)\s*:\s*([^|,]+)/i);
  const sizeMatch = text.match(/(?:^|[|,])\s*size\s*:\s*([^|,]+)/i);

  return {
    color: getCleanString(colorMatch?.[1]),
    size: getCleanString(sizeMatch?.[1]),
  };
};

const getVariantInfo = (item: OrderItem) =>
  [
    item.color ? `Color: ${item.color}` : null,
    item.size ? `Size: ${item.size}` : null,
    item.variantInfo,
  ]
    .filter(Boolean)
    .join(", ");

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

const mapOrderItem = (rawItem: unknown): OrderItem | null => {
  if (!rawItem || typeof rawItem !== "object") return null;
  const item = rawItem as Record<string, unknown>;
  const variant = parseVariantText(item.selected_variant ?? item.variantInfo);

  return {
    name: String(item.name ?? item.product_name ?? "Unnamed item"),
    price: Number(item.price ?? item.unit_price ?? 0),
    quantity: Number(item.quantity ?? 1),
    image: getCleanString(item.image ?? item.product_image),
    color: getCleanString(item.color ?? item.selected_color) ?? variant.color,
    size: getCleanString(item.size ?? item.selected_size) ?? variant.size,
    sku: getCleanString(item.sku),
    variantInfo: getCleanString(item.variantInfo ?? item.selected_variant),
    product_id: getCleanString(item.product_id),
    subtotal: Number(item.subtotal ?? 0),
    selected_color: getCleanString(item.selected_color),
    selected_size: getCleanString(item.selected_size),
  };
};

const mapOrderItems = (rawItems: unknown) =>
  parseOrderItems(rawItems).map(mapOrderItem).filter((item): item is OrderItem => item !== null);

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selected, setSelected] = useState<Order | null>(null);
  const [selectedItems, setSelectedItems] = useState<OrderItem[]>([]);
  const [savingPaymentStatus, setSavingPaymentStatus] = useState(false);
  const [generatingInvoice, setGeneratingInvoice] = useState(false);

  const fetchOrders = async () => {
    const { data } = await supabase
      .from("admin_orders")
      .select("*")
      .order("created_at", { ascending: false });
    setOrders(data || []);
  };

  useEffect(() => {
    if (!selected?.id) {
      setSelectedItems([]);
      return;
    }

    const itemsFromJson = mapOrderItems(selected.items);
    if (itemsFromJson.length > 0) {
      setSelectedItems(itemsFromJson);
      return;
    }

    supabase
      .from("order_items")
      .select("*")
      .eq("order_id", selected.id)
      .order("created_at", { ascending: true })
      .then(({ data, error }) => {
        if (error) {
          console.error("Failed to load legacy order items for admin view", error);
          setSelectedItems([]);
          return;
        }

        setSelectedItems(
          (data || []).map((item) => ({
            name: item.product_name,
            price: Number(item.price ?? item.unit_price ?? 0),
            quantity: Number(item.quantity ?? 1),
            image: item.product_image ?? undefined,
            color: item.selected_color ?? undefined,
            size: item.selected_size ?? undefined,
            sku: item.sku ?? undefined,
            product_id: item.product_id ?? undefined,
            subtotal: Number(item.subtotal ?? 0),
            selected_color: item.selected_color ?? undefined,
            selected_size: item.selected_size ?? undefined,
          })),
        );
      });
  }, [selected?.id]);

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
  }, [selected?.id]);

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

  const selectedPaymentMethodLabel =
    selected?.payment_type ||
    (selected?.payment_method === "bkash"
      ? "bKash"
      : selected?.payment_method === "nagad"
        ? "Nagad"
        : "Cash on Delivery");

  const selectedPaymentStatus =
    (selected?.payment_status as PaymentStatus | null) || "Unpaid";

  const selectedSenderNumber =
    selected?.sender_number ||
    (selected?.payment_details && typeof selected.payment_details === "object" && !Array.isArray(selected.payment_details)
      ? String((selected.payment_details as Record<string, unknown>).sender_number || "")
      : "") ||
    "—";

  const selectedTransactionId =
    selected?.transaction_id ||
    (selected?.payment_details && typeof selected.payment_details === "object" && !Array.isArray(selected.payment_details)
      ? String((selected.payment_details as Record<string, unknown>).transaction_id || "")
      : "") ||
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

  const buildInvoicePdfBlob = (
    invoice: InvoiceRpcRow,
    order: Order,
    items: OrderItem[],
    paymentStatus: PaymentStatus,
  ) => {
    const pdf = new jsPDF({ unit: "mm", format: "a4" });
    const margin = 16;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const contentWidth = pageWidth - margin * 2;
    let y = margin;

    const addWrappedText = (
      text: string,
      x: number,
      currentY: number,
      maxWidth: number,
      lineHeight = 5,
    ) => {
      const lines = pdf.splitTextToSize(text, maxWidth);
      pdf.text(lines, x, currentY);
      return currentY + lines.length * lineHeight;
    };

    const ensureSpace = (height: number) => {
      if (y + height <= pageHeight - margin) return;
      pdf.addPage();
      y = margin;
    };

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(20);
    pdf.text("LUXYNEX", margin, y);
    pdf.setFontSize(18);
    pdf.text("INVOICE", pageWidth - margin, y, { align: "right" });

    y += 8;
    pdf.setDrawColor(34, 34, 34);
    pdf.line(margin, y, pageWidth - margin, y);
    y += 12;

    pdf.setFontSize(11);
    pdf.setFont("helvetica", "bold");
    pdf.text("Invoice Details", margin, y);
    y += 7;

    pdf.setFont("helvetica", "normal");
    pdf.text(`Invoice #: ${invoice?.order_number || order?.order_number || order?.id}`, margin, y);
    pdf.text(`Date: ${new Date(order?.created_at || Date.now()).toLocaleString()}`, pageWidth - margin, y, {
      align: "right",
    });
    y += 6;
    pdf.text(`Order ID: ${order?.id || ""}`, margin, y);
    y += 6;
    pdf.text(`Payment Status: ${paymentStatus}`, margin, y);
    y += 10;

    pdf.setFont("helvetica", "bold");
    pdf.text("Bill To", margin, y);
    y += 7;

    pdf.setFont("helvetica", "normal");
    pdf.text(invoice?.customer_name || order?.customer_name || "Customer", margin, y);
    y += 6;
    pdf.text(`Phone: ${order?.customer_phone || ""}`, margin, y);
    y += 6;
    y = addWrappedText(`Address: ${order?.shipping_address || ""}`, margin, y, contentWidth);
    y += 6;

    ensureSpace(24);
    pdf.setFont("helvetica", "bold");
    pdf.text("Items", margin, y);
    y += 7;

    pdf.setFillColor(245, 245, 245);
    pdf.rect(margin, y - 5, contentWidth, 8, "F");
    pdf.setFontSize(9);
    const productX = margin + 2;
    const productWidth = 70;
    const variantX = margin + 76;
    const variantWidth = 42;
    const qtyX = margin + 122;
    const unitX = margin + 138;
    const totalX = pageWidth - margin - 2;

    pdf.text("Product", productX, y);
    pdf.text("Variant", variantX, y);
    pdf.text("Qty", qtyX, y);
    pdf.text("Unit", unitX, y);
    pdf.text("Total", totalX, y, { align: "right" });
    y += 7;

    pdf.setFont("helvetica", "normal");
    items.forEach((item) => {
      const productLines = pdf.splitTextToSize(
        item?.name || "Unnamed item",
        productWidth,
      );
      const variantText = getVariantInfo(item);
      const variantLines = variantText
        ? pdf.splitTextToSize(variantText, variantWidth)
        : ["Standard"];
      const rowHeight =
        Math.max(productLines.length, variantLines.length, 1) * 4 + 4;
      ensureSpace(rowHeight + 2);

      const itemPrice = Number(item?.price ?? 0);
      const itemQuantity = Number(item?.quantity ?? 0);
      const itemTotal = itemPrice * itemQuantity;
      pdf.text(productLines, productX, y);
      if (!variantText) {
        pdf.setTextColor(95, 95, 95);
      }
      pdf.text(variantLines, variantX, y);
      pdf.setTextColor(0, 0, 0);
      pdf.text(String(itemQuantity), qtyX, y);
      pdf.text(formatInvoiceCurrency(itemPrice), unitX, y);
      pdf.text(formatInvoiceCurrency(itemTotal), totalX, y, {
        align: "right",
      });
      y += rowHeight;
    });

    if (items.length === 0) {
      pdf.text("No item data found in this order.", margin + 2, y);
      y += 8;
    }

    y += 6;
    ensureSpace(34);
    pdf.line(margin, y, pageWidth - margin, y);
    y += 8;

    const totalsX = pageWidth - margin - 2;
    pdf.setFontSize(10);
    pdf.text("Subtotal:", margin, y);
    pdf.text(formatInvoiceCurrency(order?.subtotal), totalsX, y, { align: "right" });
    y += 6;
    pdf.text("Delivery:", margin, y);
    pdf.text(formatInvoiceCurrency(order?.shipping_fee), totalsX, y, { align: "right" });
    y += 6;
    pdf.text("Total:", margin, y);
    pdf.setFont("helvetica", "bold");
    pdf.text(formatInvoiceCurrency(invoice?.order_total ?? order?.total), totalsX, y, {
      align: "right",
    });
    y += 14;

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    y = addWrappedText("Thank you for your business. For inquiries, contact support@luxynex.com.", margin, y, contentWidth);

    if (invoice?.invoice_html) {
      pdf.setProperties({
        title: `Invoice ${invoice?.order_number || order?.order_number || order?.id}`,
        subject: "Generated from public.generate_order_invoice",
      });
    }

    return pdf.output("blob");
  };

  const buildInvoiceJsonBlob = (
    invoice: InvoiceRpcRow,
    order: Order,
    items: OrderItem[],
    paymentStatus: PaymentStatus,
  ) =>
    new Blob(
      [
        JSON.stringify(
          {
            invoice: invoice ?? {},
            order: {
              id: order?.id,
              order_number: order?.order_number,
              customer_name: order?.customer_name,
              customer_phone: order?.customer_phone,
              shipping_address: order?.shipping_address,
              subtotal: order?.subtotal,
              shipping_fee: order?.shipping_fee,
              total: order?.total,
              payment_status: paymentStatus,
              created_at: order?.created_at,
            },
            items: items ?? [],
            generated_at: new Date().toISOString(),
          },
          null,
          2,
        ),
      ],
      { type: "application/json" },
    );

  const generateInvoice = async () => {
    const order = selected;
    if (!order?.id) {
      const message = "No order is selected for invoice generation.";
      toast.error(message);
      window.alert(message);
      return;
    }

    const items = Array.isArray(selectedItems) ? selectedItems : [];
    const paymentStatus = selectedPaymentStatus || "Unpaid";

    setGeneratingInvoice(true);
    
    try {
      const response = (await supabase.rpc("generate_order_invoice" as never, {
        p_order_id: order.id,
      } as never)) as InvoiceRpcResponse | undefined;
      const error = response?.error ?? null;
      const data = response?.data ?? null;

      if (error) {
        const message =
          "Failed to generate invoice: " +
          (error?.message || "Supabase returned an unknown error.");
        toast.error(message);
        window.alert(message);
        return;
      }

      const invoice = getInvoiceRow(data);
      if (!invoice) {
        const message =
          "No invoice data was returned from Supabase. Please verify this order exists and try again.";
        toast.error(message);
        window.alert(message);
        return;
      }

      try {
        const blob = buildInvoicePdfBlob(invoice, order, items, paymentStatus);
        const filename = sanitizeDownloadName(`invoice_${order.id}.pdf`);
        downloadBlob(blob, filename);
        toast.success("Invoice PDF downloaded successfully");
      } catch (pdfError) {
        console.error("PDF invoice generation failed; downloading JSON fallback.", pdfError);
        const fallbackBlob = buildInvoiceJsonBlob(invoice, order, items, paymentStatus);
        const fallbackFilename = sanitizeDownloadName(`invoice_${order.id}.json`);
        downloadBlob(fallbackBlob, fallbackFilename);
        toast.success("Invoice data downloaded as JSON");
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "The invoice download failed.";
      toast.error("Error generating invoice: " + message);
      window.alert("Error generating invoice: " + message);
      console.error(err);
    } finally {
      setGeneratingInvoice(false);
    }
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
                        Total Payable Amount
                      </p>
                      <p className="mt-1 text-lg font-semibold text-white">
                        ৳{Number(selected.total).toLocaleString()}
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
                      <span className="text-slate-400">City:</span>{" "}
                      <strong>{selected.city || "Not provided"}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400">Delivery Zone:</span>{" "}
                      <strong>{selected.delivery_zone || "Not provided"}</strong>
                    </div>
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
                    {selectedItems.length > 0 && (
                      <div className="border-t border-white/10 pt-3">
                        <p className="mb-2 text-xs font-semibold uppercase text-slate-300">Products:</p>
                        <div className="space-y-1 text-xs">
                          {selectedItems.map((item, idx) => (
                            <div key={idx} className="text-slate-300">
                              {item.sku && <span className="font-semibold text-slate-100">{item.sku}</span>}
                              {item.sku && " - "}
                              {item.name}
                              {item.quantity > 1 && ` (x${item.quantity})`}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
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
                                {item.sku && <span>SKU: {item.sku}</span>}
                                <span>Qty: {item.quantity}</span>
                                <span>Color: {item.color || "N/A"}</span>
                                <span>Size: {item.size || "N/A"}</span>
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
                  variant="outline"
                  onClick={() => generateInvoice()}
                  disabled={generatingInvoice}
                  className="gap-2 border-blue-500/30 bg-blue-500 text-white hover:bg-blue-600 hover:text-white"
                >
                  <FileText className="h-4 w-4" />
                  {generatingInvoice ? "Generating..." : "Generate Invoice"}
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
