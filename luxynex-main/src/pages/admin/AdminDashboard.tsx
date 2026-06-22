import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import {
  ShoppingCart,
  Package,
  Users,
  DollarSign,
  TrendingUp,
  Clock,
} from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    orders: 0,
    products: 0,
    customers: 0,
    revenue: 0,
    pendingOrders: 0,
    todayOrders: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const [ordersRes, productsRes, customersRes] = await Promise.all([
        supabase.from("admin_orders").select("total, status, created_at"),
        supabase
          .from("admin_products")
          .select("id", { count: "exact", head: true }),
        supabase
          .from("admin_customers")
          .select("id", { count: "exact", head: true }),
      ]);

      const orders = ordersRes.data || [];
      const revenue = orders.reduce(
        (sum, o) => sum + (Number(o.total) || 0),
        0,
      );
      const pendingOrders = orders.filter((o) => o.status === "pending").length;
      const today = new Date().toISOString().split("T")[0];
      const todayOrders = orders.filter((o) =>
        o.created_at?.startsWith(today),
      ).length;

      setStats({
        orders: orders.length,
        products: productsRes.count || 0,
        customers: customersRes.count || 0,
        revenue,
        pendingOrders,
        todayOrders,
      });
    };
    fetchStats();
  }, []);

  const cards = [
    {
      label: "Total Revenue",
      value: `৳${stats.revenue.toLocaleString()}`,
      icon: DollarSign,
      color: "text-green-600 bg-green-50",
    },
    {
      label: "Total Orders",
      value: stats.orders,
      icon: ShoppingCart,
      color: "text-blue-600 bg-blue-50",
    },
    {
      label: "Products",
      value: stats.products,
      icon: Package,
      color: "text-purple-600 bg-purple-50",
    },
    {
      label: "Customers",
      value: stats.customers,
      icon: Users,
      color: "text-orange-600 bg-orange-50",
    },
    {
      label: "Pending Orders",
      value: stats.pendingOrders,
      icon: Clock,
      color: "text-yellow-600 bg-yellow-50",
    },
    {
      label: "Today's Orders",
      value: stats.todayOrders,
      icon: TrendingUp,
      color: "text-cyan-600 bg-cyan-50",
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((card) => (
            <Card key={card.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.label}
                </CardTitle>
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center ${card.color}`}
                >
                  <card.icon className="w-4 h-4" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-foreground">
                  {card.value}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
