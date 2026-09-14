import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import BrandLogo from "@/components/layout/BrandLogo";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  LogOut,
  Menu,
  X,
  ChevronDown,
  FolderTree,
  Boxes,
  Truck,
  FileText,
  Ticket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type NavChild = { label: string; path: string };
type NavGroup = { label: string; icon: any; children: NavChild[] };

const navGroups: NavGroup[] = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    children: [
      { label: "Overview", path: "/admin" },
      { label: "Warehouse", path: "/admin/warehouse" },
    ],
  },
  {
    label: "Orders",
    icon: ShoppingCart,
    children: [
      { label: "Order List", path: "/admin/orders" },
      { label: "Create Order", path: "/admin/orders/create" },
      { label: "Scan to Update", path: "/admin/orders/scan" },
      { label: "Order Report", path: "/admin/orders/report" },
    ],
  },
  {
    label: "Products",
    icon: Package,
    children: [
      { label: "All Products", path: "/admin/products" },
      { label: "Create Product", path: "/admin/products/create" },
      { label: "Download Barcodes", path: "/admin/products/barcodes" },
    ],
  },
  {
    label: "Stocks",
    icon: Boxes,
    children: [{ label: "All Stocks", path: "/admin/stocks" }],
  },
  {
    label: "Purchases",
    icon: Truck,
    children: [
      { label: "All Purchase", path: "/admin/purchases" },
      { label: "Add Purchase", path: "/admin/purchases/add" },
    ],
  },
  {
    label: "Categories & Subcategories",
    icon: FolderTree,
    children: [
      { label: "All Categories", path: "/admin/categories" },
      { label: "All Subcategories", path: "/admin/subcategories" },
      { label: "Create Category", path: "/admin/categories/create" },
      { label: "Create Subcategory", path: "/admin/subcategories/create" },
    ],
  },
  {
    label: "Customers",
    icon: Users,
    children: [
      { label: "All Customers", path: "/admin/customers" },
      { label: "New Customers", path: "/admin/customers/new" },
      { label: "Support Tickets", path: "/admin/support-tickets" },
    ],
  },
  {
    label: "Coupons",
    icon: Ticket,
    children: [
      { label: "All Coupons", path: "/admin/coupons" },
      { label: "Create Coupon", path: "/admin/coupons/create" },
    ],
  },
  {
    label: "Content Management",
    icon: FileText,
    children: [
      { label: "Banner Update", path: "/admin/banners" },
      { label: "Popups", path: "/admin/popups" },
    ],
  },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { loading, isAdmin, signOut } = useAdminAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    navGroups.forEach((g) => {
      init[g.label] = g.children.some((c) => c.path === location.pathname);
    });
    return init;
  });
  const toggleGroup = (label: string) =>
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-background border-r border-border flex flex-col transition-transform duration-200 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <BrandLogo
              alt="Luxynex Logo"
              imageClassName="h-12 w-12 object-contain"
              className="h-12 w-12 rounded-2xl bg-slate-100 p-2"
            />
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                Admin Portal
              </p>
              <p className="text-base font-semibold text-foreground">Luxynex</p>
            </div>
          </div>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Manage store operations, track sales, and monitor inventory with a clean admin experience.
          </p>
          <button className="mt-3 lg:hidden inline-flex items-center justify-center rounded-xl border border-border bg-background p-2 text-foreground shadow-sm" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-3">
          {navGroups.map((group) => {
            const isOpen =
              openGroups[group.label] ??
              group.children.some((c) => c.path === location.pathname);
            const hasActive = group.children.some(
              (c) => c.path === location.pathname,
            );
            return (
              <div key={group.label} className="rounded-3xl border border-border bg-background/80">
                <button
                  onClick={() => toggleGroup(group.label)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition ${hasActive ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"}`}
                >
                  <group.icon className="w-4 h-4" />
                  <span className="flex-1 text-left">{group.label}</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {isOpen && (
                  <div className="space-y-1 border-t border-border px-4 py-3">
                    {group.children.map((child) => {
                      const active = location.pathname === child.path;
                      return (
                        <Link
                          key={child.path}
                          to={child.path}
                          onClick={() => setSidebarOpen(false)}
                          className={`block rounded-2xl px-3 py-2 text-sm transition ${active ? "bg-primary text-primary-foreground font-semibold" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
                        >
                          {child.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="p-3 border-t border-border">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-destructive hover:text-destructive"
            onClick={signOut}
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="sticky top-0 z-30 bg-background border-b border-border px-4 py-3 flex items-center gap-3 lg:hidden">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-bold text-foreground">Admin Panel</span>
        </header>
        <main className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
