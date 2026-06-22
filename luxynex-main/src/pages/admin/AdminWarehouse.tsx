import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Package, AlertTriangle, XCircle, Boxes } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Product = Tables<"admin_products">;

export default function AdminWarehouse() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    supabase
      .from("admin_products")
      .select("*")
      .order("stock")
      .then((r) => setProducts(r.data || []));
  }, []);

  const totalUnits = products.reduce((s, p) => s + p.stock, 0);
  const totalValue = products.reduce(
    (s, p) => s + p.stock * Number(p.price),
    0,
  );
  const lowStock = products.filter((p) => p.stock > 0 && p.stock < 10);
  const outOfStock = products.filter((p) => p.stock === 0);

  const stats = [
    {
      label: "Total Products",
      value: products.length,
      icon: Package,
      color: "text-primary",
    },
    {
      label: "Total Units",
      value: totalUnits,
      icon: Boxes,
      color: "text-primary",
    },
    {
      label: "Low Stock",
      value: lowStock.length,
      icon: AlertTriangle,
      color: "text-yellow-600",
    },
    {
      label: "Out of Stock",
      value: outOfStock.length,
      icon: XCircle,
      color: "text-destructive",
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">
            Warehouse Overview
          </h1>
          <p className="text-sm text-muted-foreground">
            Inventory value:{" "}
            <strong className="text-primary">
              ৳{totalValue.toLocaleString()}
            </strong>
          </p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <Card key={s.label}>
              <CardContent className="p-4 flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-lg bg-muted flex items-center justify-center ${s.color}`}
                >
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
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center text-muted-foreground py-8"
                      >
                        No products
                      </TableCell>
                    </TableRow>
                  ) : (
                    products.map((p) => {
                      const status =
                        p.stock === 0 ? "out" : p.stock < 10 ? "low" : "ok";
                      return (
                        <TableRow key={p.id}>
                          <TableCell className="font-medium flex items-center gap-2">
                            {p.images?.[0] && (
                              <img
                                src={p.images[0]}
                                alt=""
                                className="w-8 h-8 rounded object-cover"
                              />
                            )}
                            {p.name}
                          </TableCell>
                          <TableCell className="text-xs">
                            {p.sku || "—"}
                          </TableCell>
                          <TableCell>
                            <strong>{p.stock}</strong>
                          </TableCell>
                          <TableCell>
                            ৳{(p.stock * Number(p.price)).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                status === "out"
                                  ? "destructive"
                                  : status === "low"
                                    ? "secondary"
                                    : "default"
                              }
                            >
                              {status === "out"
                                ? "Out of stock"
                                : status === "low"
                                  ? "Low"
                                  : "In stock"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })
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
