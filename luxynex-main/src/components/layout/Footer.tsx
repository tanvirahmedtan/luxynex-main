import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Facebook,
  Instagram,
  MessageCircle,
  Music2,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { useCategories } from "@/hooks/useCategories";
import logoImage from "@/assets/logo-luxynex.jpg";
import {
  SOCIAL_LINKS,
  WHATSAPP_URL,
  WHATSAPP_NUMBER,
  BUSINESS_EMAIL,
} from "@/lib/contact";

const quickLinks = [
  { label: "Home", to: "/" },
  { label: "Shop", to: "/shop" },
  { label: "Track Order", to: "/track" },
  { label: "About Us", to: "/about-us" },
  { label: "Contact", to: "/contact" },
];

export default function Footer() {
  const { categories, loading } = useCategories();
  const navigate = useNavigate();
  const location = useLocation();
  const categoryLinks = categories
    .slice(0, 6)
    .map((c) => ({ label: c.name, to: `/shop?cat=${c.slug}` }));

  const policyLinks = [
    { label: "Privacy Policy", to: "/privacy-policy" },
    { label: "Terms of Service", to: "/terms-of-service" },
    { label: "Return & Refund", to: "/return-and-refund" },
  ];

  const handlePolicyClick = async (to: string) => {
    if (location.pathname === to) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    await navigate(to);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  return (
    <footer className="mt-16 border-t border-black/10 bg-[#111111] text-white">
      <div className="container mx-auto px-4 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <img
              src={logoImage}
              alt="Luxynex"
              className="w-10 h-10 rounded-xl object-cover"
            />
            <span className="text-lg font-bold tracking-wide text-white">LUXYNEX</span>
          </div>
          <p className="mb-4 text-sm text-white/70">
            Glow. Scent. Style. — Premium Perfumes, Attar & Smart Gadgets.<br />
            Your One-Stop Destination for Premium Lifestyle Products & Trending Gadgets in Bangladesh.
          </p>
          <div className="flex gap-2">
            <a
              href={SOCIAL_LINKS.facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/80 transition-all hover:scale-[1.03] hover:bg-[#1877F2] hover:text-white"
            >
              <Facebook className="w-4 h-4" />
            </a>
            <a
              href={SOCIAL_LINKS.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/80 transition-all hover:scale-[1.03] hover:bg-[#E1306C] hover:text-white"
            >
              <Instagram className="w-4 h-4" />
            </a>
            <a
              href={SOCIAL_LINKS.tiktok}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/80 transition-all hover:scale-[1.03] hover:bg-white hover:text-[#111111]"
            >
              <Music2 className="w-4 h-4" />
            </a>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/80 transition-all hover:scale-[1.03] hover:bg-[#25D366] hover:text-white"
            >
              <MessageCircle className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="mb-4 text-sm font-bold text-white">
            Quick Links
          </h4>
          <ul className="space-y-2">
            {quickLinks.map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  className="text-sm text-white/70 transition-colors hover:text-primary"
                >
                  {l.label}
                </Link>
              </li>
            ))}
            {policyLinks.map((link) => (
              <li key={link.to} className="sm:hidden">
                <Link
                  to={link.to}
                  className="text-sm text-white/70 transition-colors hover:text-primary"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Categories */}
        <div>
          <h4 className="mb-4 text-sm font-bold text-white">Categories</h4>
          <ul className="space-y-2">
            {loading && (
              <li className="text-sm text-white/70">Loading…</li>
            )}
            {!loading && categoryLinks.length === 0 && (
              <li className="text-sm text-white/70">
                No categories yet.
              </li>
            )}
            {categoryLinks.map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  className="text-sm text-white/70 transition-colors hover:text-primary"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="mb-4 text-sm font-bold text-white">Contact Us</h4>
          <ul className="space-y-3">
            <li className="flex items-center gap-2 text-sm text-white/70">
              <Mail className="w-4 h-4 text-primary" />{" "}
              <a
                href={`mailto:${BUSINESS_EMAIL}`}
                className="hover:text-primary"
              >
                {BUSINESS_EMAIL}
              </a>
            </li>
            <li className="flex items-center gap-2 text-sm text-white/70">
              <MessageCircle className="w-4 h-4 text-[#25D366]" />{" "}
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary"
              >
                WhatsApp: {WHATSAPP_NUMBER}
              </a>
            </li>
            <li className="flex items-center gap-2 text-sm text-white/70">
              <MapPin className="w-4 h-4 text-primary" /> Dhaka, Bangladesh
            </li>
          </ul>
        </div>
      </div>

      {/* Payment & Copyright */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 footer-safe">
          <p className="text-xs text-white/55">
            © 2026 Lucynex. All Rights Reserved. | Owned & Operated by Tanvir Ahmed
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-white/55 sm:justify-end">
            <span className="rounded-lg border border-white/10 bg-white/5 px-3 py-1 font-medium">
              bKash
            </span>
            <span className="rounded-lg border border-white/10 bg-white/5 px-3 py-1 font-medium">
              Nagad
            </span>
            <span className="rounded-lg border border-white/10 bg-white/5 px-3 py-1 font-medium">
              COD
            </span>
            <span className="mx-1 hidden h-4 w-px bg-white/15 sm:block" />
            {policyLinks.map((link) => (
              <button
                key={link.to}
                type="button"
                onClick={() => handlePolicyClick(link.to)}
                className="rounded-md px-1 py-1 font-medium text-white/65 transition-colors hover:text-primary"
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
