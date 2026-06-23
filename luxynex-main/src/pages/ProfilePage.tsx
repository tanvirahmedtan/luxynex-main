import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  User,
  Phone,
  Mail,
  Package,
  Lock,
  LogOut,
  Edit2,
  Save,
  Heart,
  Clock,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Star,
  Ticket,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import CustomerReviews from "@/components/dashboard/CustomerReviews";
import SupportTickets from "@/components/dashboard/SupportTickets";
import CreateTicket from "@/components/dashboard/CreateTicket";
import type { Database } from "@/integrations/supabase/types";

type AdminOrder = Database["public"]["Tables"]["admin_orders"]["Row"];
type AdminCustomer = Database["public"]["Tables"]["admin_customers"]["Row"];

const statusColor = (status: string) => {
  const map: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    confirmed: "bg-blue-100 text-blue-700",
    processing: "bg-indigo-100 text-indigo-700",
    shipped: "bg-purple-100 text-purple-700",
    delivered: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  };
  return map[status] || "bg-muted text-muted-foreground";
};

const formatCurrency = (value: number) => `৳${value.toLocaleString("en-US")}`;
const formatDate = (value?: string) =>
  value
    ? new Date(value).toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

export default function ProfilePage() {
  const { user, profile, loading, signOut, refreshProfile } = useAuth();
  const { items: wishlistItems } = useWishlist();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const section = searchParams.get("section") || "overview";
  const action = searchParams.get("action") || undefined;
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ full_name: "", phone: "" });
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [customerSummary, setCustomerSummary] = useState<AdminCustomer | null>(null);
  const [changingPassword, setChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    if (!loading && !user) navigate("/signin");
  }, [loading, user, navigate]);

  useEffect(() => {
    if (profile) {
      setForm({ full_name: profile.full_name, phone: profile.phone });
    }
  }, [profile]);

  useEffect(() => {
    if (!user) return;

    const filters = [];
    if (user.email) filters.push(`customer_email.eq.${user.email}`);
    if (profile?.phone) filters.push(`customer_phone.eq.${profile.phone}`);

    const query = supabase
      .from("admin_orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (filters.length > 0) query.or(filters.join(","));

    query.then(({ data }) => setOrders(data || []));
  }, [user, profile]);

  useEffect(() => {
    if (!user) return;

    const filters = [];
    if (user.email) filters.push(`email.eq.${user.email}`);
    if (profile?.phone) filters.push(`phone.eq.${profile.phone}`);

    if (filters.length === 0) return;

    supabase
      .from("admin_customers")
      .select("*")
      .or(filters.join(","))
      .single()
      .then(({ data }) => {
        if (data) setCustomerSummary(data);
      });
  }, [user, profile]);

  const stats = useMemo(() => {
    const revenue = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
    const pending = orders.filter((order) => order.status === "pending").length;
    const delivered = orders.filter((order) => order.status === "delivered").length;

    return {
      totalOrders: customerSummary?.total_orders ?? orders.length,
      totalSpent: customerSummary?.total_spent ?? revenue,
      pendingOrders: pending,
      deliveredOrders: delivered,
      averageOrder: orders.length > 0 ? revenue / orders.length : 0,
    };
  }, [orders, customerSummary]);

  const recentOrders = orders.slice(0, 3);
  const wishlistPreview = wishlistItems.slice(0, 3);

  const handleSaveProfile = async () => {
    if (!profile || !user) return;

    const { error } = await supabase
      .from("profiles")
      .update({ full_name: form.full_name, phone: form.phone })
      .eq("user_id", user.id);

    if (error) {
      toast.error("Failed to update profile");
      return;
    }

    toast.success("Profile updated!");
    await refreshProfile();
    setEditing(false);
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Password changed!");
    setChangingPassword(false);
    setNewPassword("");
  };

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-6 space-y-3">
          <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">
            Customer dashboard
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Hello, {profile?.full_name || user.email}
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Manage your orders, wishlist, and account preferences from one place.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="space-y-6">
            <Card className="overflow-hidden">
              <div className="bg-gradient-to-br from-primary to-cyan-600 p-6 text-white">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-white/80">
                      Account summary
                    </p>
                    <h2 className="mt-4 text-2xl font-semibold">
                      {profile?.full_name || "Valued customer"}
                    </h2>
                  </div>
                  <div className="rounded-2xl bg-white/15 p-3">
                    <ShieldCheck className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="mt-6 grid gap-3 text-sm">
                  <div className="rounded-3xl bg-white/10 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-white/60">
                      Orders placed
                    </p>
                    <p className="mt-2 text-2xl font-semibold">
                      {stats.totalOrders}
                    </p>
                  </div>
                  <div className="rounded-3xl bg-white/10 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-white/60">
                      Total spent
                    </p>
                    <p className="mt-2 text-2xl font-semibold">
                      {formatCurrency(stats.totalSpent)}
                    </p>
                  </div>
                </div>
              </div>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  <Button asChild size="sm" className="w-full">
                    <Link to="/wishlist">View wishlist</Link>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link to="/shop">Continue shopping</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex items-center justify-between">
                <CardTitle className="text-base">Quick links</CardTitle>
                <Badge variant="outline">{wishlistItems.length} saved</Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link
                  to="/profile"
                  className="flex items-center justify-between rounded-2xl border border-border px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent/50"
                >
                  Account settings
                  <ChevronRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/wishlist"
                  className="flex items-center justify-between rounded-2xl border border-border px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent/50"
                >
                  Wishlist
                  <ChevronRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/shop"
                  className="flex items-center justify-between rounded-2xl border border-border px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent/50"
                >
                  Browse new arrivals
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </CardContent>
            </Card>
          </aside>

          <section className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  label: "Total spent",
                  value: formatCurrency(stats.totalSpent),
                  icon: Sparkles,
                  accent: "from-emerald-50 via-emerald-100 to-emerald-50 text-emerald-600",
                },
                {
                  label: "Orders",
                  value: stats.totalOrders,
                  icon: Package,
                  accent: "from-sky-50 via-sky-100 to-sky-50 text-sky-600",
                },
                {
                  label: "Pending",
                  value: stats.pendingOrders,
                  icon: Clock,
                  accent: "from-amber-50 via-amber-100 to-amber-50 text-amber-600",
                },
                {
                  label: "Wishlist",
                  value: wishlistItems.length,
                  icon: Heart,
                  accent: "from-pink-50 via-pink-100 to-pink-50 text-pink-600",
                },
              ].map((card) => (
                <Card key={card.label}>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          {card.label}
                        </p>
                        <p className="mt-2 text-2xl font-semibold text-foreground">
                          {card.value}
                        </p>
                      </div>
                      <div
                        className={`rounded-2xl ${card.accent} p-3`}
                      >
                        <card.icon className="h-5 w-5" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
              <Card className="space-y-4">
                <CardHeader className="flex items-center justify-between">
                  <CardTitle className="text-lg">Recent orders</CardTitle>
                  <Badge variant="secondary">{orders.length} total</Badge>
                </CardHeader>
                <CardContent className="space-y-3">
                  {orders.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                      No orders have been placed yet.
                    </div>
                  ) : (
                    recentOrders.map((order) => (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className="rounded-3xl border border-border bg-background p-4"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm font-semibold text-foreground">
                              {order.order_number}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(order.created_at)} • {order.customer_name}
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-semibold text-foreground">
                              {formatCurrency(Number(order.total || 0))}
                            </span>
                            <Badge className="uppercase" variant="outline">
                              {order.status}
                            </Badge>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </CardContent>
              </Card>

              <Card className="space-y-4">
                <CardHeader className="flex items-center justify-between">
                  <CardTitle className="text-lg">Wishlist preview</CardTitle>
                  <Badge variant="outline">{wishlistItems.length}</Badge>
                </CardHeader>
                <CardContent>
                  {wishlistItems.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                      Your wishlist is empty. Save favorites while browsing.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {wishlistPreview.map((item) => (
                        <div
                          key={item.id}
                          className="rounded-3xl border border-border p-4"
                        >
                          <p className="font-medium text-foreground">
                            {item.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formatCurrency(item.originalPrice ?? item.price)}
                          </p>
                        </div>
                      ))}
                      {wishlistItems.length > 3 && (
                        <Link
                          to="/wishlist"
                          className="inline-flex items-center gap-2 text-sm font-medium text-primary"
                        >
                          View full wishlist <ChevronRight className="h-4 w-4" />
                        </Link>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-lg">Account details</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Update your profile and password securely.
                  </p>
                </div>
                {!editing ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditing(true)}
                  >
                    <Edit2 className="w-4 h-4 mr-1" /> Edit profile
                  </Button>
                ) : (
                  <Button size="sm" onClick={handleSaveProfile}>
                    <Save className="w-4 h-4 mr-1" /> Save changes
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-xs flex items-center gap-1">
                      <User className="w-3 h-3" /> Full Name
                    </Label>
                    {editing ? (
                      <Input
                        value={form.full_name}
                        onChange={(e) =>
                          setForm({ ...form, full_name: e.target.value })
                        }
                      />
                    ) : (
                      <p className="font-medium">{profile?.full_name || "—"}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-xs flex items-center gap-1">
                      <Phone className="w-3 h-3" /> Phone
                    </Label>
                    {editing ? (
                      <Input
                        value={form.phone}
                        onChange={(e) =>
                          setForm({ ...form, phone: e.target.value })
                        }
                      />
                    ) : (
                      <p className="font-medium">{profile?.phone || "—"}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-xs flex items-center gap-1">
                      <Mail className="w-3 h-3" /> Email
                    </Label>
                    <p className="font-medium">{user.email}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-xs">User ID</Label>
                    <p className="font-mono text-xs text-muted-foreground">
                      {user.id}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-3 rounded-3xl border border-border bg-muted/10 p-4">
                      <Lock className="h-5 w-5 text-foreground" />
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          Keep your account secure
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Update your password whenever you want.
                        </p>
                      </div>
                    </div>
                    {changingPassword ? (
                      <div className="flex flex-col gap-3 sm:flex-row">
                        <Input
                          type="password"
                          placeholder="New password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="min-w-[220px]"
                        />
                        <Button onClick={handleChangePassword}>Update</Button>
                        <Button
                          variant="ghost"
                          onClick={() => setChangingPassword(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={() => setChangingPassword(true)}
                      >
                        Change password
                      </Button>
                    )}
                  </div>
                </div>

                <Button
                  variant="destructive"
                  onClick={signOut}
                  className="gap-2"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </Button>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
    </div>
  );
}
