import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  ShoppingCart,
  Package,
  Menu,
  X,
  User,
  LogIn,
} from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useProducts } from "@/hooks/useProducts";
import { motion, AnimatePresence } from "framer-motion";
import BrandLogo from "./BrandLogo";
const navLinks = [
  { label: "Home", to: "/" },
  { label: "Shop", to: "/shop" },
  { label: "Track Order", to: "/track" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { totalItems } = useCart();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { products } = useProducts();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const suggestions =
    searchQuery.length > 1
      ? products
          .filter((p) =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()),
          )
          .slice(0, 5)
      : [];

  const resetSearch = () => {
    setSearchQuery("");
  };

  const submitSearch = () => {
    const query = searchQuery.trim();
    if (!query) return;
    navigate(`/shop?q=${encodeURIComponent(query)}`);
    resetSearch();
  };

  return (
    <>
      <div className="announcement-bar min-w-0 overflow-hidden">
        <div className="marquee-track max-w-full">
          <span>🚚 Free Delivery on orders above ৳5000!</span>
          <span>🚚 Free Delivery on orders above ৳5000!</span>
          <span>🚚 Free Delivery on orders above ৳5000!</span>
          <span>🚚 Free Delivery on orders above ৳5000!</span>
          <span>🚚 Free Delivery on orders above ৳5000!</span>
          <span>🚚 Free Delivery on orders above ৳5000!</span>
        </div>
      </div>
      <header
        className={`sticky top-0 z-50 min-w-0 border-b border-gray-100 bg-white/95 backdrop-blur-md transition-all duration-300 ${scrolled ? "shadow-sm" : ""}`}
      >
        <div className="container mx-auto flex h-14 min-w-0 items-center justify-between gap-2 px-3 sm:px-4">
          <Link to="/" className="flex min-w-0 shrink-0 items-center gap-2 sm:gap-3">
            <BrandLogo imageClassName="h-9 w-9 object-contain sm:h-10 sm:w-10" />
            <span className="text-sm font-bold tracking-wide text-foreground sm:text-lg">
              LUXYNEX
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-5">
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="relative hidden min-w-0 flex-1 items-center gap-2 md:flex md:max-w-sm lg:max-w-md">
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="min-w-0 flex-1 rounded-xl border border-border bg-muted px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
              onKeyDown={(e) => {
                if (e.key === "Enter") submitSearch();
              }}
            />
            <button
              type="button"
              onClick={submitSearch}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-colors hover:bg-primary/90"
              aria-label="Submit product search"
            >
              <Search className="h-4 w-4" />
            </button>
            {suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-xl border border-border bg-background shadow-lg">
                {suggestions.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      navigate(`/product/${p.id}`);
                      resetSearch();
                    }}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-muted"
                  >
                    <img
                      src={p.image}
                      alt={p.name}
                      className="h-8 w-8 rounded object-cover"
                    />
                    <span className="text-foreground">{p.name}</span>
                    <span className="ml-auto font-semibold text-primary">
                      ৳{p.price}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex min-w-0 items-center gap-0 sm:gap-1">
            <Link
              to="/cart"
              className="p-2 rounded-xl hover:bg-muted transition-colors relative"
            >
              <ShoppingCart className="w-5 h-5 text-foreground" />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {totalItems}
                </span>
              )}
            </Link>
            <Link
              to="/track"
              className="hidden rounded-xl p-2 transition-colors hover:bg-muted sm:flex"
            >
              <Package className="w-5 h-5 text-foreground" />
            </Link>

            {user ? (
              <Link
                to="/profile"
                className="flex items-center gap-1.5 rounded-xl p-2 transition-colors hover:bg-muted"
              >
                <User className="w-5 h-5 text-foreground" />
                <span className="hidden sm:inline text-sm font-medium text-foreground max-w-[80px] truncate">
                  {profile?.full_name || "Profile"}
                </span>
              </Link>
            ) : (
              <Link
                to="/signin"
                className="ml-1 flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-sm font-bold text-primary-foreground transition-all duration-200 hover:scale-[1.02] hover:bg-primary/90"
              >
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">Sign In</span>
              </Link>
            )}

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="rounded-xl p-2 transition-colors hover:bg-muted lg:hidden"
            >
              {mobileOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

          <div className="flex overflow-visible border-t border-border md:hidden">
            <div className="container relative mx-auto flex min-w-0 gap-2 px-3 py-2.5 sm:px-4 sm:py-3">
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="min-w-0 flex-1 rounded-xl border border-border bg-muted px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") submitSearch();
                  }}
                />
                <button
                  type="button"
                  onClick={submitSearch}
                  className="flex shrink-0 items-center justify-center rounded-xl bg-primary px-4 text-primary-foreground transition-colors hover:bg-primary/90"
                  aria-label="Submit product search"
                >
                  <Search className="h-4 w-4" />
                </button>
                {suggestions.length > 0 && (
                  <div className="absolute left-3 right-3 top-full z-50 mt-1 overflow-hidden rounded-xl border border-border bg-background shadow-lg sm:left-4 sm:right-4">
                    {suggestions.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          navigate(`/product/${p.id}`);
                          resetSearch();
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted text-left text-sm"
                      >
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-8 h-8 rounded object-cover"
                        />
                        <span className="text-foreground">{p.name}</span>
                        <span className="ml-auto text-primary font-semibold">
                          ৳{p.price}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-border lg:hidden"
            >
              <nav className="container mx-auto px-4 py-4 flex flex-col gap-1">
                {navLinks.map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-xl px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
                  >
                    {l.label}
                  </Link>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
