import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Slide = {
  id: string;
  title: string;
  subtitle: string;
  image_url: string;
  link_url: string;
};

export default function HeroSlider() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);

  const CACHE_KEY = "luxynex_banners_v1";
  const CACHE_TTL = 1000 * 60 * 10; // 10 minutes

  useEffect(() => {
    const load = async () => {
      try {
        // Try cache first
        const raw = localStorage.getItem(CACHE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed?.ts && Date.now() - parsed.ts < CACHE_TTL && Array.isArray(parsed.data)) {
            setSlides(parsed.data);
            setLoading(false);
            return;
          }
        }

        const { data, error } = await supabase
          .from("admin_banners")
          .select("id, title, subtitle, image_url, link_url")
          .eq("is_active", true)
          .order("sort_order");
        if (error) throw error;
        const mapped = (data || []).map((d) => ({
          id: d.id,
          title: d.title || "",
          subtitle: d.subtitle || "",
          image_url: d.image_url,
          link_url: d.link_url || "/shop",
        }));
        // Only render admin-approved banners; if empty, keep slides empty so skeleton shows
        setSlides(mapped);
        // cache
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data: mapped }));
        } catch (e) {
          // ignore storage errors
        }
      } catch (err) {
        // on error, keep slides empty to avoid showing any unapproved/fallback banners
        setSlides([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => setCurrent((p) => (p + 1) % slides.length), 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const slide = slides[current] || slides[0];
  if (loading || !slide) {
    // show skeleton while loading or when no slides
    return (
      <div className="relative h-full min-h-[280px] overflow-hidden rounded-2xl border border-border bg-muted sm:min-h-[380px] lg:h-[380px] xl:h-[420px] 2xl:h-[460px]">
        <div className="animate-pulse h-full w-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200" />
      </div>
    );
  }

  return (
    <div className="relative h-full min-h-[280px] overflow-hidden rounded-2xl border border-border bg-muted sm:min-h-[380px] lg:h-[380px] xl:h-[420px] 2xl:h-[460px]">
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="absolute inset-0"
        >
          <Link to={slide.link_url} className="block w-full h-full relative">
            <img
              src={slide.image_url}
              alt={slide.title}
              className="absolute inset-0 w-full h-full object-cover transform-gpu will-change-transform"
              loading={current === 0 ? "eager" : "lazy"}
              {...(current === 0 ? { fetchPriority: "high" as any } : {})}
            />
            {(slide.title || slide.subtitle) && (
              <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-transparent flex items-center p-6 sm:p-10">
                <div className="max-w-md text-white">
                  {slide.subtitle && (
                    <p className="text-sm font-semibold mb-2 opacity-90">
                      {slide.subtitle}
                    </p>
                  )}
                  {slide.title && (
                    <h1 className="text-3xl sm:text-4xl font-bold mb-4">
                      {slide.title}
                    </h1>
                  )}
                  <span className="inline-block primary-btn px-6 py-3 text-sm">
                    Shop Now →
                  </span>
                </div>
              </div>
            )}
          </Link>
        </motion.div>
      </AnimatePresence>
      <button
        onClick={() =>
          setCurrent((p) => (p - 1 + slides.length) % slides.length)
        }
        className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background shadow border border-border flex items-center justify-center hover:bg-muted transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <button
        onClick={() => setCurrent((p) => (p + 1) % slides.length)}
        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background shadow border border-border flex items-center justify-center hover:bg-muted transition-colors"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-2 h-2 rounded-full transition-all ${i === current ? "w-6 bg-primary" : "bg-foreground/20"}`}
          />
        ))}
      </div>
    </div>
  );
}
