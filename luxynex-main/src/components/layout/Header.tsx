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
  const [searchOpen, setSearchOpen] = useState(false);
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

  return (
    <>
      <div className="announcement-bar">
        <div className="marquee-track">
          <span>🚚 Free Delivery on orders above ৳5000!</span>
          <span>🚚 Free Delivery on orders above ৳5000!</span>
          <span>🚚 Free Delivery on orders above ৳5000!</span>
          <span>🚚 Free Delivery on orders above ৳5000!</span>
          <span>🚚 Free Delivery on orders above ৳5000!</span>
          <span>🚚 Free Delivery on orders above ৳5000!</span>
        </div>
      </div>
      <header
        className={`sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur-md transition-all duration-300 ${scrolled ? "shadow-sm" : ""}`}
      >
        <div className="container mx-auto flex items-center justify-between h-14 px-4">
          <Link to="/" className="flex items-center gap-3">
            <img
              src="/assets/logo.png"
              alt="Luxynex"
              className="w-10 h-10 rounded-xl object-cover"
            />
            <span className="text-lg font-bold text-foreground hidden sm:inline tracking-wide">
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

          <div className="flex items-center gap-1">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 rounded-xl hover:bg-muted transition-colors"
            >
              <Search className="w-5 h-5 text-foreground" />
            </button>
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

        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-border"
            >
              <div className="container mx-auto px-4 py-3 relative">
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full rounded-xl bg-muted px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && searchQuery) {
                      navigate(`/shop?q=${searchQuery}`);
                      setSearchOpen(false);
                      setSearchQuery("");
                    }
                  }}
                />
                {suggestions.length > 0 && (
                  <div className="absolute left-4 right-4 top-full mt-1 bg-background border border-border rounded-xl shadow-lg overflow-hidden z-50">
                    {suggestions.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          navigate(`/product/${p.id}`);
                          setSearchOpen(false);
                          setSearchQuery("");
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
            </motion.div>
          )}
        </AnimatePresence>

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
