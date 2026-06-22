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
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import type { Tables } from "@/integrations/supabase/types";

type Product = Tables<"admin_products">;
type LineItem = {
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
};

export default function AdminCreateOrder() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [items, setItems] = useState<LineItem[]>([]);
  const [pickProduct, setPickProduct] = useState("");
  const [form, setForm] = useState({
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    shipping_address: "",
    shipping_fee: 60,
    discount: 0,
    payment_method: "cod" as "cod" | "bkash" | "nagad" | "rocket",
    notes: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase
      .from("admin_products")
      .select("*")
      .eq("is_active", true)
      .order("name")
      .then((r) => setProducts(r.data || []));
  }, []);

  const addItem = () => {
    const p = products.find((x) => x.id === pickProduct);
    if (!p) return;
    if (items.find((i) => i.product_id === p.id)) {
      toast.error("Already added");
      return;
    }
    setItems([
      ...items,
      {
        product_id: p.id,
        name: p.name,
        price: Number(p.price),
        quantity: 1,
        image: p.images?.[0],
      },
    ]);
    setPickProduct("");
  };

  const updateQty = (i: number, q: number) =>
    setItems(
      items.map((it, idx) =>
        idx === i ? { ...it, quantity: Math.max(1, q) } : it,
      ),
    );
  const removeItem = (i: number) =>
    setItems(items.filter((_, idx) => idx !== i));

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const total = subtotal + Number(form.shipping_fee) - Number(form.discount);

  const save = async () => {
    if (!form.customer_name || !form.customer_phone || !form.shipping_address) {
      toast.error("Customer name, phone and address required");
      return;
    }
    if (items.length === 0) {
      toast.error("Add at least one product");
      return;
    }
    setSaving(true);
    const order_number = `LXV-${Date.now().toString().slice(-8)}`;
    const { error } = await supabase.from("admin_orders").insert([
      {
        order_number,
        customer_name: form.customer_name,
        customer_phone: form.customer_phone,
        customer_email: form.customer_email || null,
        shipping_address: form.shipping_address,
        payment_method: form.payment_method,
        payment_status: "unpaid",
        status: "confirmed",
        items: items as any,
        subtotal,
        shipping_fee: form.shipping_fee,
        discount: form.discount,
        total,
        notes: form.notes || null,
      },
    ]);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`Order ${order_number} created`);
    navigate("/admin/orders");
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-4xl">
        <h1 className="text-2xl font-bold text-foreground">Create Order</h1>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Customer Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
                value={form.customer_name}
                onChange={(e) =>
                  setForm({ ...form, customer_name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Phone *</Label>
              <Input
                value={form.customer_phone}
                onChange={(e) =>
                  setForm({ ...form, customer_phone: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                value={form.customer_email}
                onChange={(e) =>
                  setForm({ ...form, customer_email: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select
                value={form.payment_method}
                onValueChange={(v: any) =>
                  setForm({ ...form, payment_method: v })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cod">Cash on Delivery</SelectItem>
                  <SelectItem value="bkash">bKash</SelectItem>
                  <SelectItem value="nagad">Nagad</SelectItem>
                  <SelectItem value="rocket">Rocket</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Shipping Address *</Label>
              <Textarea
                value={form.shipping_address}
                onChange={(e) =>
                  setForm({ ...form, shipping_address: e.target.value })
                }
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Notes</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Select value={pickProduct} onValueChange={setPickProduct}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select product to add" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} — ৳{Number(p.price)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={addItem} disabled={!pickProduct}>
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </div>
            {items.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No items added
              </p>
            ) : (
              items.map((it, i) => (
                <div
                  key={it.product_id}
                  className="flex items-center gap-3 p-2 border rounded-lg"
                >
                  {it.image && (
                    <img
                      src={it.image}
                      alt={it.name}
                      className="w-12 h-12 rounded object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-sm">{it.name}</p>
                    <p className="text-xs text-muted-foreground">৳{it.price}</p>
                  </div>
                  <Input
                    type="number"
                    min={1}
                    className="w-20"
                    value={it.quantity}
                    onChange={(e) => updateQty(i, Number(e.target.value))}
                  />
                  <p className="font-semibold w-24 text-right">
                    ৳{it.price * it.quantity}
                  </p>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-destructive"
                    onClick={() => removeItem(i)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))
            )}

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="space-y-2">
                <Label>Shipping Fee (৳)</Label>
                <Input
                  type="number"
                  value={form.shipping_fee}
                  onChange={(e) =>
                    setForm({ ...form, shipping_fee: Number(e.target.value) })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Discount (৳)</Label>
                <Input
                  type="number"
                  value={form.discount}
                  onChange={(e) =>
                    setForm({ ...form, discount: Number(e.target.value) })
                  }
                />
              </div>
            </div>

            <div className="border-t pt-3 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>৳{subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>৳{form.shipping_fee}</span>
              </div>
              {form.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-৳{form.discount}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total</span>
                <span className="text-primary">৳{total}</span>
              </div>
            </div>

            <Button className="w-full" onClick={save} disabled={saving}>
              {saving ? "Creating…" : "Create Order"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
