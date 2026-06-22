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
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type Purchase = Tables<"admin_purchases">;

export default function AdminPurchases() {
  const [rows, setRows] = useState<Purchase[]>([]);
  const load = async () => {
    const { data } = await supabase
      .from("admin_purchases")
      .select("*")
      .order("created_at", { ascending: false });
    setRows(data || []);
  };
  useEffect(() => {
    load();
  }, []);

  const remove = async (id: string) => {
    if (
      !confirm(
        "Delete this purchase record? Stock will not be decreased automatically.",
      )
    )
      return;
    await supabase.from("admin_purchases").delete().eq("id", id);
    toast.success("Deleted");
    load();
  };

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Purchases</h1>
          <Button asChild>
            <Link to="/admin/purchases/add">
              <Plus className="w-4 h-4 mr-1" />
              Add Purchase
            </Link>
          </Button>
        </div>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Unit Cost</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center text-muted-foreground py-8"
                      >
                        No purchases yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    rows.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">
                          {p.product_name}
                        </TableCell>
                        <TableCell>{p.supplier || "—"}</TableCell>
                        <TableCell>{p.quantity}</TableCell>
                        <TableCell>৳{Number(p.unit_cost)}</TableCell>
                        <TableCell>৳{Number(p.total_cost)}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(p.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-destructive"
                            onClick={() => remove(p.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
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
