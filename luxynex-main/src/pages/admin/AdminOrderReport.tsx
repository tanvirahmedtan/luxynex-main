import { useEffect, useMemo, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Download, ShoppingBag, Banknote, TrendingUp } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Order = Tables<"admin_orders">;

const todayISO = () => new Date().toISOString().slice(0, 10);
const daysAgoISO = (n: number) =>
  new Date(Date.now() - n * 86400000).toISOString().slice(0, 10);

export default function AdminOrderReport() {
  const [from, setFrom] = useState(daysAgoISO(30));
  const [to, setTo] = useState(todayISO());
  const [orders, setOrders] = useState<Order[]>([]);

  const load = async () => {
    const { data } = await supabase
      .from("admin_orders")
      .select("*")
      .gte("created_at", `${from}T00:00:00`)
      .lte("created_at", `${to}T23:59:59`)
      .order("created_at", { ascending: false });
    setOrders(data || []);
  };
  useEffect(() => {
    load();
  }, [from, to]);

  const stats = useMemo(() => {
    const paid = orders.filter((o) => o.status !== "cancelled");
    const revenue = paid.reduce((s, o) => s + Number(o.total), 0);
    return {
      count: orders.length,
      revenue,
      avg: paid.length ? Math.round(revenue / paid.length) : 0,
    };
  }, [orders]);

  const exportCsv = () => {
    const header = [
      "Order #",
      "Date",
      "Customer",
      "Phone",
      "Status",
      "Payment",
      "Total",
    ];
    const rows = orders.map((o) => [
      o.order_number,
      new Date(o.created_at).toLocaleDateString(),
      o.customer_name,
      o.customer_phone,
      o.status,
      o.payment_method,
      Number(o.total),
    ]);
    const csv = [header, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders-${from}-to-${to}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-end gap-3 justify-between">
          <h1 className="text-2xl font-bold text-foreground">Order Report</h1>
          <div className="flex gap-3 items-end">
            <div className="space-y-1">
              <Label className="text-xs">From</Label>
              <Input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">To</Label>
              <Input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
            </div>
            <Button onClick={exportCsv}>
              <Download className="w-4 h-4 mr-1" />
              Export CSV
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "Total Orders", value: stats.count, icon: ShoppingBag },
            {
              label: "Total Revenue",
              value: `৳${stats.revenue.toLocaleString()}`,
              icon: Banknote,
            },
            {
              label: "Avg Order Value",
              value: `৳${stats.avg.toLocaleString()}`,
              icon: TrendingUp,
            },
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <s.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-xl font-bold">{s.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center text-muted-foreground py-8"
                      >
                        No orders in this range
                      </TableCell>
                    </TableRow>
                  ) : (
                    orders.map((o) => (
                      <TableRow key={o.id}>
                        <TableCell className="font-medium">
                          {o.order_number}
                        </TableCell>
                        <TableCell className="text-xs">
                          {new Date(o.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {o.customer_name}
                          <div className="text-xs text-muted-foreground">
                            {o.customer_phone}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              o.status === "cancelled"
                                ? "destructive"
                                : "default"
                            }
                            className="capitalize"
                          >
                            {o.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="capitalize text-xs">
                          {o.payment_method}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          ৳{Number(o.total)}
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
    </AdminLayout>
  );
}
