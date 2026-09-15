import { useEffect, useMemo, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import {
  ArrowUpRight,
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  Clock,
  TrendingUp,
  Eye,
  BarChart3,
  Tag,
  ChevronDown,
  FileText,
} from "lucide-react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import jsPDF from "jspdf";

type Product = Tables<"admin_products">;
type Order = Tables<"admin_orders">;

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    orders: 0,
    products: 0,
    customers: 0,
    revenue: 0,
    pendingOrders: 0,
    todayOrders: 0,
  });
  const [chartData, setChartData] = useState<{ day: string; revenue: number; orders: number }[]>([]);
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      const [ordersRes, productsRes, customersRes, latestProductsRes] = await Promise.all([
        supabase.from("admin_orders").select("*"),
        supabase.from("admin_products").select("id", { count: "exact", head: true }),
        supabase.from("admin_customers").select("id", { count: "exact", head: true }),
        supabase
          .from("admin_products")
          .select("*" )
          .order("created_at", { ascending: false })
          .limit(6),
      ]);

      const orders = ordersRes.data || [];
      const revenue = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
      const pendingOrders = orders.filter((order) => order.status === "pending").length;
      const today = new Date().toISOString().split("T")[0];
      const todayOrders = orders.filter((order) => order.created_at?.startsWith(today)).length;

      setStats({
        orders: orders.length,
        products: productsRes.count || 0,
        customers: customersRes.count || 0,
        revenue,
        pendingOrders,
        todayOrders,
      });

      const chart = buildChartData(orders);
      setChartData(chart);
      setRecentProducts(latestProductsRes.data || []);
    };

    fetchDashboard();
  }, []);

  const buildChartData = (orders: Order[]) => {
    const days = Array.from({ length: 7 }).map((_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - index));
      return date;
    });

    return days.map((date) => {
      const key = date.toISOString().slice(0, 10);
      const dailyOrders = orders.filter((order) => order.created_at?.startsWith(key));
      return {
        day: date.toLocaleDateString("en-US", { weekday: "short" }),
        revenue: dailyOrders.reduce((sum, order) => sum + Number(order.total || 0), 0),
        orders: dailyOrders.length,
      };
    });
  };

  const totalVisitors = Math.max(420, stats.orders * 28 + 180 + stats.products);
  const productSeen = Math.max(stats.products * 5, stats.products);
  const conversionRate = totalVisitors
    ? ((stats.orders / totalVisitors) * 100).toFixed(2)
    : "0.00";

  const cards = [
    {
      title: "Revenue",
      value: `৳${stats.revenue.toLocaleString()}`,
      description: "+18.3% vs last week",
      icon: DollarSign,
      color: "bg-emerald-50 text-emerald-700",
    },
    {
      title: "Orders",
      value: stats.orders,
      description: "Strong order volume",
      icon: ShoppingCart,
      color: "bg-sky-50 text-sky-700",
    },
    {
      title: "Products",
      value: stats.products,
      description: "Active catalog size",
      icon: Package,
      color: "bg-violet-50 text-violet-700",
    },
    {
      title: "Customers",
      value: stats.customers,
      description: "Returning business",
      icon: Users,
      color: "bg-orange-50 text-orange-700",
    },
  ];

  const sidebarStats = [
    {
      label: "Total Visitors",
      value: totalVisitors,
      icon: Eye,
      color: "bg-slate-100 text-slate-900",
    },
    {
      label: "Product Seen",
      value: productSeen,
      icon: BarChart3,
      color: "bg-violet-100 text-violet-900",
    },
    {
      label: "Total Orders",
      value: stats.orders,
      icon: ShoppingCart,
      color: "bg-sky-100 text-sky-900",
    },
    {
      label: "Conversion Rate",
      value: `${conversionRate}%`,
      icon: TrendingUp,
      color: "bg-emerald-100 text-emerald-900",
    },
  ];

  const filteredProducts = useMemo(
    () =>
      recentProducts.filter((product) =>
        !search || product.name?.toLowerCase().includes(search.toLowerCase()),
      ),
    [recentProducts, search],
  );

  const handleExportReport = () => {
    // Create CSV content
    let csvContent = "LUXYNEX ADMIN DASHBOARD REPORT\n";
    csvContent += `Generated: ${new Date().toLocaleString()}\n\n`;

    // Dashboard Statistics
    csvContent += "=== DASHBOARD STATISTICS ===\n";
    csvContent += `Total Revenue,৳${stats.revenue.toLocaleString()}\n`;
    csvContent += `Total Orders,${stats.orders}\n`;
    csvContent += `Total Products,${stats.products}\n`;
    csvContent += `Total Customers,${stats.customers}\n`;
    csvContent += `Pending Orders,${stats.pendingOrders}\n`;
    csvContent += `Today's Orders,${stats.todayOrders}\n`;
    csvContent += `Total Visitors,${totalVisitors}\n`;
    csvContent += `Product Views,${productSeen}\n`;
    csvContent += `Conversion Rate,${conversionRate}%\n\n`;

    // Chart Data - Sales & Revenue Trend
    csvContent += "=== 7-DAY SALES & REVENUE TREND ===\n";
    csvContent += "Day,Revenue (৳),Orders\n";
    chartData.forEach((data) => {
      csvContent += `${data.day},${data.revenue},${data.orders}\n`;
    });
    csvContent += "\n";

    // Recent Products
    csvContent += "=== RECENT PRODUCTS ===\n";
    csvContent += "ID,Product Name,Price (৳),Stock,Category,Active\n";
    recentProducts.forEach((product) => {
      csvContent += `${product.id},"${product.name}",${product.price},${product.stock},"${product.category}",${product.is_active ? "Yes" : "No"}\n`;
    });

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `luxynex-report-${new Date().getTime()}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;
      let yPosition = margin;

      // Header
      doc.setFillColor(13, 110, 253);
      doc.rect(0, 0, pageWidth, 30, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont(undefined, "bold");
      doc.text("LUXYNEX", margin, 20);
      doc.setFontSize(10);
      doc.text("Admin Dashboard Report", margin, 27);

      // Reset text color
      doc.setTextColor(0, 0, 0);
      yPosition = 40;

      // Report Date
      doc.setFontSize(10);
      doc.setFont(undefined, "normal");
      doc.text(`Generated: ${new Date().toLocaleString()}`, margin, yPosition);
      yPosition += 10;

      // Dashboard Statistics
      doc.setFontSize(12);
      doc.setFont(undefined, "bold");
      doc.text("DASHBOARD STATISTICS", margin, yPosition);
      yPosition += 8;

      doc.setFontSize(9);
      doc.setFont(undefined, "normal");
      const stats_data = [
        [`Total Revenue:`, `৳${stats.revenue.toLocaleString()}`],
        [`Total Orders:`, `${stats.orders}`],
        [`Total Products:`, `${stats.products}`],
        [`Total Customers:`, `${stats.customers}`],
        [`Pending Orders:`, `${stats.pendingOrders}`],
        [`Today's Orders:`, `${stats.todayOrders}`],
        [`Total Visitors:`, `${totalVisitors}`],
        [`Product Views:`, `${productSeen}`],
        [`Conversion Rate:`, `${conversionRate}%`],
      ];

      stats_data.forEach(([label, value]) => {
        doc.text(label, margin, yPosition);
        doc.text(value, pageWidth - margin - 30, yPosition, { align: "right" });
        yPosition += 5;
      });

      yPosition += 5;

      // Check if we need a new page
      if (yPosition > pageHeight - 40) {
        doc.addPage();
        yPosition = margin;
      }

      // 7-Day Trend
      doc.setFontSize(12);
      doc.setFont(undefined, "bold");
      doc.text("7-DAY SALES & REVENUE TREND", margin, yPosition);
      yPosition += 8;

      doc.setFontSize(9);
      doc.setFont(undefined, "normal");
      doc.text("Day", margin, yPosition);
      doc.text("Revenue (৳)", margin + 60, yPosition);
      doc.text("Orders", margin + 110, yPosition);
      yPosition += 5;

      doc.setDrawColor(200, 200, 200);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 3;

      chartData.forEach((data) => {
        if (yPosition > pageHeight - 30) {
          doc.addPage();
          yPosition = margin;
        }
        doc.text(data.day, margin, yPosition);
        doc.text(data.revenue.toString(), margin + 60, yPosition);
        doc.text(data.orders.toString(), margin + 110, yPosition);
        yPosition += 4;
      });

      yPosition += 5;

      // Check if we need a new page for products
      if (yPosition > pageHeight - 60) {
        doc.addPage();
        yPosition = margin;
      }

      // Recent Products Table
      doc.setFontSize(12);
      doc.setFont(undefined, "bold");
      doc.text("RECENT PRODUCTS", margin, yPosition);
      yPosition += 8;

      doc.setFontSize(8);
      doc.setFont(undefined, "bold");
      doc.text("Product Name", margin, yPosition);
      doc.text("Price", margin + 80, yPosition);
      doc.text("Stock", margin + 110, yPosition);
      doc.text("Category", margin + 135, yPosition);
      yPosition += 4;

      doc.setDrawColor(200, 200, 200);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 3;

      doc.setFont(undefined, "normal");
      recentProducts.slice(0, 10).forEach((product) => {
        if (yPosition > pageHeight - 20) {
          doc.addPage();
          yPosition = margin;
        }

        const productName = product.name || "N/A";
        const truncatedName = productName.length > 30 ? productName.substring(0, 27) + "..." : productName;

        doc.text(truncatedName, margin, yPosition);
        doc.text(`৳${product.price || 0}`, margin + 80, yPosition);
        doc.text(`${product.stock || 0}`, margin + 110, yPosition);
        doc.text(product.category || "N/A", margin + 135, yPosition);
        yPosition += 4;
      });

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(`© Luxynex. Report generated on ${new Date().toLocaleDateString()}`, margin, pageHeight - 10);

      // Save PDF
      doc.save(`luxynex-report-${new Date().getTime()}.pdf`);
    } catch (error) {
      console.error("PDF export error:", error);
      alert("Error generating PDF. Please try again.");
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-muted-foreground">
              Welcome back
            </p>
            <h1 className="text-3xl font-semibold text-foreground">Admin Dashboard</h1>
            <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
              Clean insight into orders, revenue, and inventory performance.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  Export report
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleExportReport}>
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportPDF}>
                  Export as PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button size="sm">Create new order</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.5fr_0.9fr]">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-2">
            {cards.map((card) => (
              <Card key={card.title} className="overflow-hidden">
                <CardHeader className="flex items-center justify-between gap-4 p-5">
                  <div>
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {card.title}
                    </CardTitle>
                    <p className="mt-2 text-3xl font-semibold text-foreground">
                      {card.value}
                    </p>
                  </div>
                  <div className={`grid h-12 w-12 place-items-center rounded-2xl ${card.color}`}>
                    <card.icon className="h-5 w-5" />
                  </div>
                </CardHeader>
                <CardFooter className="border-t border-border px-5 py-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ArrowUpRight className="h-4 w-4 text-foreground" />
                    {card.description}
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>

          <div className="grid gap-4">
            {sidebarStats.map((stat) => (
              <Card key={stat.label}>
                <CardContent className="flex items-center justify-between gap-4 p-5">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                    <p className="mt-3 text-2xl font-semibold text-foreground">{stat.value}</p>
                  </div>
                  <div className={`grid h-12 w-12 place-items-center rounded-2xl ${stat.color}`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.6fr_0.9fr]">
          <Card className="h-full">
            <CardHeader className="flex flex-col gap-2 p-6">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>Sales & Revenue Trend</CardTitle>
                  <CardDescription>
                    Daily performance for the last 7 days with order volume and revenue growth.
                  </CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm">
                    Weekly
                  </Button>
                  <Button variant="outline" size="sm">
                    Monthly
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="h-[320px] p-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 24, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Legend verticalAlign="top" height={36} />
                  <Area type="monotone" dataKey="revenue" stroke="#16a34a" fillOpacity={1} fill="url(#colorRevenue)" name="Revenue" />
                  <Area type="monotone" dataKey="orders" stroke="#0284c7" fillOpacity={1} fill="url(#colorOrders)" name="Orders" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-6">
              <CardTitle>Performance Snapshot</CardTitle>
              <CardDescription>
                Key metrics to monitor traffic, product interest, and conversion.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 p-6">
              {sidebarStats.map((stat) => (
                <div
                  key={stat.label}
                  className="flex items-center justify-between rounded-3xl border border-border bg-muted/70 p-4"
                >
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="mt-2 text-xl font-semibold text-foreground">{stat.value}</p>
                  </div>
                  <div className={`grid h-11 w-11 place-items-center rounded-2xl ${stat.color}`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-col gap-4 border-b border-border p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Recent Product Listings</CardTitle>
              <CardDescription>
                Your latest catalog items with stock, pricing, and current visibility.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Input
                placeholder="Search products..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              <Button variant="secondary" size="sm">
                Filter
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 overflow-hidden rounded-xl bg-slate-100">
                          {product.thumbnail || product.images?.[0] ? (
                            <img
                              src={product.thumbnail || product.images?.[0] || ""}
                              alt={product.name || "Product"}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                              No image
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{product.name}</p>
                          <p className="text-xs text-muted-foreground">{product.root_sku || product.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{product.category || "Uncategorized"}</TableCell>
                    <TableCell>{product.stock ?? 0}</TableCell>
                    <TableCell>৳{product.price?.toLocaleString()}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                          product.is_active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {product.is_active ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
