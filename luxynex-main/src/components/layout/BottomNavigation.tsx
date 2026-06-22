import { Link, useLocation } from "react-router-dom";
import { Home, ShoppingBag, MessageCircle, Heart } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

export default function BottomNavigation() {
  const isMobile = useIsMobile();
  const location = useLocation();

  if (!isMobile) return null;

  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/shop", icon: ShoppingBag, label: "Shop" },
    { path: "/contact", icon: MessageCircle, label: "Message" },
    { path: "/wishlist", icon: Heart, label: "Wishlist" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[#111111] safe-area-bottom">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center px-2 py-1 rounded-lg transition-colors ${
                isActive ? "text-primary" : "text-white/70 hover:text-white"
              }`}
            >
              <item.icon className="w-6 h-6" />
              <span className="text-xs mt-1 font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
