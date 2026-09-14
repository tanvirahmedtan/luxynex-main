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
      <div className="relative h-full min-h-[240px] w-full overflow-hidden rounded-none border-0 bg-muted sm:min-h-[380px] sm:rounded-2xl sm:border sm:border-border lg:h-[380px] xl:h-[420px] 2xl:h-[460px]">
        <div className="animate-pulse h-full w-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200" />
      </div>
    );
  }

  return (
    <div className="relative h-full min-h-[240px] w-full overflow-hidden rounded-none border-0 bg-muted sm:min-h-[380px] sm:rounded-2xl sm:border sm:border-border lg:h-[380px] xl:h-[420px] 2xl:h-[460px]">
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
              className="absolute inset-0 h-full w-full object-cover transform-gpu will-change-transform"
              loading={current === 0 ? "eager" : "lazy"}
              {...(current === 0 ? { fetchPriority: "high" as any } : {})}
            />
            {(slide.title || slide.subtitle) && (
              <div className="absolute inset-x-3 bottom-3 flex rounded-xl bg-white/95 px-4 py-3 shadow-lg sm:inset-0 sm:items-center sm:rounded-none sm:bg-gradient-to-r sm:from-black/80 sm:via-black/45 sm:to-black/10 sm:px-10 sm:py-10 sm:shadow-none">
                <div className="max-w-md text-foreground sm:text-white sm:drop-shadow-md">
                  {slide.subtitle && (
                    <p className="mb-1 max-w-[32rem] text-xs font-semibold leading-relaxed text-foreground/75 sm:mb-2 sm:text-base sm:text-white/95">
                      {slide.subtitle}
                    </p>
                  )}
                  {slide.title && (
                    <h1 className="mb-2 max-w-[32rem] text-lg font-bold leading-tight text-foreground sm:mb-4 sm:text-4xl sm:text-white">
                      {slide.title}
                    </h1>
                  )}
                  <span className="primary-btn inline-flex px-4 py-2 text-xs shadow-md sm:px-6 sm:py-3 sm:text-sm sm:shadow-lg sm:shadow-black/25">
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
        className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background shadow transition-colors hover:bg-muted"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <button
        onClick={() => setCurrent((p) => (p + 1) % slides.length)}
        className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background shadow transition-colors hover:bg-muted"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
      <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-2 rounded-full bg-black/35 px-2.5 py-1.5 sm:bottom-3 sm:bg-transparent sm:px-0 sm:py-0">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-2 rounded-full transition-all ${i === current ? "w-6 bg-primary" : "w-2 bg-white/90 shadow-sm"}`}
          />
        ))}
      </div>
    </div>
  );
}
