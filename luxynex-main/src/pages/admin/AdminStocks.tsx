import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type Product = Tables<"admin_products">;

export default function AdminStocks() {
  const [products, setProducts] = useState<Product[]>([]);
  const [edits, setEdits] = useState<Record<string, number>>({});
  const [search, setSearch] = useState("");

  const load = async () => {
    const { data } = await supabase
      .from("admin_products")
      .select("*")
      .order("name");
    setProducts(data || []);
  };
  useEffect(() => {
    load();
  }, []);

  const save = async (id: string) => {
    const v = edits[id];
    if (v === undefined) return;
    const { error } = await supabase
      .from("admin_products")
      .update({ stock: v })
      .eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Stock updated");
    const { [id]: _, ...rest } = edits;
    setEdits(rest);
    load();
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <AdminLayout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-foreground">Stock Levels</h1>
        <Input
          placeholder="Search products…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Current Stock</TableHead>
                    <TableHead>Update To</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center text-muted-foreground py-8"
                      >
                        No products
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((p) => {
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
                            <Input
                              type="number"
                              className="w-24"
                              value={edits[p.id] ?? p.stock}
                              onChange={(e) =>
                                setEdits({
                                  ...edits,
                                  [p.id]: Number(e.target.value),
                                })
                              }
                            />
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
                          <TableCell>
                            <Button
                              size="sm"
                              disabled={
                                edits[p.id] === undefined ||
                                edits[p.id] === p.stock
                              }
                              onClick={() => save(p.id)}
                            >
                              Save
                            </Button>
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
