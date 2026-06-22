import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, Ticket } from "lucide-react";

type Coupon = {
  id: string;
  code: string;
  description: string;
  discount_percent: number;
  discount_amount: number;
  min_order_amount: number;
  is_active: boolean;
};

export function AdminCouponsList() {
  const [items, setItems] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setItems(data || []);
    setLoading(false);
  };
  useEffect(() => {
    load();
  }, []);

  const toggleActive = async (c: Coupon) => {
    const { error } = await (supabase as any)
      .from("coupons")
      .update({ is_active: !c.is_active })
      .eq("id", c.id);
    if (error) return toast.error(error.message);
    toast.success("Updated");
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this coupon?")) return;
    const { error } = await (supabase as any)
      .from("coupons")
      .delete()
      .eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    load();
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Ticket className="w-6 h-6 text-primary" /> Coupons
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage discount codes shown on product pages.
          </p>
        </div>
        <Link to="/admin/coupons/create">
          <Button>
            <Plus className="w-4 h-4 mr-1" /> Create Coupon
          </Button>
        </Link>
      </div>

      <div className="bg-background rounded-2xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="p-3">Code</th>
              <th className="p-3">Description</th>
              <th className="p-3">Discount</th>
              <th className="p-3">Min Order</th>
              <th className="p-3">Active</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td
                  colSpan={6}
                  className="p-6 text-center text-muted-foreground"
                >
                  Loading...
                </td>
              </tr>
            )}
            {!loading && items.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="p-6 text-center text-muted-foreground"
                >
                  No coupons yet.
                </td>
              </tr>
            )}
            {items.map((c) => (
              <tr key={c.id} className="border-t border-border">
                <td className="p-3 font-bold text-primary">{c.code}</td>
                <td className="p-3">{c.description}</td>
                <td className="p-3">
                  {c.discount_percent > 0
                    ? `${c.discount_percent}%`
                    : `৳${c.discount_amount}`}
                </td>
                <td className="p-3">৳{c.min_order_amount}</td>
                <td className="p-3">
                  <Switch
                    checked={c.is_active}
                    onCheckedChange={() => toggleActive(c)}
                  />
                </td>
                <td className="p-3 text-right space-x-2">
                  <Link
                    to={`/admin/coupons/edit/${c.id}`}
                    className="inline-flex"
                  >
                    <Button size="sm" variant="outline">
                      <Pencil className="w-3 h-3" />
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => remove(c.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}

export function AdminCouponForm() {
  const { id } = useParams();
  const editing = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState({
    code: "",
    description: "",
    discount_percent: 0,
    discount_amount: 0,
    min_order_amount: 0,
    is_active: true,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!editing) return;
    (async () => {
      const { data } = await (supabase as any)
        .from("coupons")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (data) setForm(data);
    })();
  }, [id, editing]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code.trim()) return toast.error("Code is required");
    setLoading(true);
    const payload = { ...form, code: form.code.trim().toUpperCase() };
    const { error } = editing
      ? await (supabase as any).from("coupons").update(payload).eq("id", id)
      : await (supabase as any).from("coupons").insert(payload);
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success(editing ? "Coupon updated" : "Coupon created");
    navigate("/admin/coupons");
  };

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">
        {editing ? "Edit Coupon" : "Create Coupon"}
      </h1>
      <form
        onSubmit={save}
        className="space-y-4 max-w-xl bg-background rounded-2xl border border-border p-6"
      >
        <div>
          <Label>Coupon Code</Label>
          <Input
            value={form.code}
            onChange={(e) =>
              setForm({ ...form, code: e.target.value.toUpperCase() })
            }
            placeholder="GLOW20"
          />
        </div>
        <div>
          <Label>Description</Label>
          <Textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Flat 20% off above ৳2000"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Discount %</Label>
            <Input
              type="number"
              min={0}
              max={100}
              value={form.discount_percent}
              onChange={(e) =>
                setForm({ ...form, discount_percent: Number(e.target.value) })
              }
            />
          </div>
          <div>
            <Label>Discount Amount (৳)</Label>
            <Input
              type="number"
              min={0}
              value={form.discount_amount}
              onChange={(e) =>
                setForm({ ...form, discount_amount: Number(e.target.value) })
              }
            />
          </div>
        </div>
        <div>
          <Label>Minimum Order (৳)</Label>
          <Input
            type="number"
            min={0}
            value={form.min_order_amount}
            onChange={(e) =>
              setForm({ ...form, min_order_amount: Number(e.target.value) })
            }
          />
        </div>
        <div className="flex items-center gap-3">
          <Switch
            checked={form.is_active}
            onCheckedChange={(v) => setForm({ ...form, is_active: v })}
          />
          <Label>Active</Label>
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Coupon"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/admin/coupons")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </AdminLayout>
  );
}
