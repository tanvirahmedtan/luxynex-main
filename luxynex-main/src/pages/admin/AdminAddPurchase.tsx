import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import type { Tables } from "@/integrations/supabase/types";

type Product = Tables<"admin_products">;

export default function AdminAddPurchase() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState({
    product_id: "",
    supplier: "",
    quantity: 1,
    unit_cost: 0,
    notes: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase
      .from("admin_products")
      .select("*")
      .order("name")
      .then((r) => setProducts(r.data || []));
  }, []);

  const product = products.find((p) => p.id === form.product_id);
  const total = Number(form.quantity) * Number(form.unit_cost);

  const save = async () => {
    if (!product) {
      toast.error("Select a product");
      return;
    }
    if (form.quantity <= 0) {
      toast.error("Quantity must be > 0");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("admin_purchases").insert([
      {
        product_id: product.id,
        product_name: product.name,
        supplier: form.supplier || null,
        quantity: form.quantity,
        unit_cost: form.unit_cost,
        total_cost: total,
        notes: form.notes || null,
      },
    ]);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`Purchase added · stock +${form.quantity}`);
    navigate("/admin/purchases");
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-2xl">
        <h1 className="text-2xl font-bold text-foreground">Add Purchase</h1>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Purchase Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Product *</Label>
              <Select
                value={form.product_id}
                onValueChange={(v) => setForm({ ...form, product_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} (stock: {p.stock})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Supplier</Label>
              <Input
                value={form.supplier}
                onChange={(e) => setForm({ ...form, supplier: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Quantity *</Label>
                <Input
                  type="number"
                  min={1}
                  value={form.quantity}
                  onChange={(e) =>
                    setForm({ ...form, quantity: Number(e.target.value) })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Unit Cost (৳)</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.unit_cost}
                  onChange={(e) =>
                    setForm({ ...form, unit_cost: Number(e.target.value) })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t">
              <span>Total Cost</span>
              <span className="text-primary">৳{total}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Stock will be increased automatically when saved.
            </p>
            <Button className="w-full" onClick={save} disabled={saving}>
              {saving ? "Saving…" : "Save Purchase"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
