import { useEffect } from "react";
import { motion } from "framer-motion";
import SEO from "@/components/SEO";

export default function About() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="About Lucynex — Premium Lifestyle Store in Bangladesh"
        description="Learn more about Lucynex, a premium lifestyle destination in Bangladesh for perfumes, attar, and modern gadgets."
        url="/about"
      />
      <main className="container mx-auto px-4 py-10 sm:py-14 max-w-5xl">
        <section className="relative overflow-hidden rounded-[2rem] border border-black/10 bg-[#111111] px-6 py-10 text-white shadow-sm sm:px-10 sm:py-14">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.18),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.06),transparent_30%)]" />
          <div className="relative space-y-6">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
              About
            </p>
            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl sm:text-5xl font-bold leading-tight"
            >
              About LUCYNEX
            </motion.h1>
            <div className="max-w-3xl space-y-4 text-sm sm:text-base leading-8 text-white/80">
              <motion.p
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 }}
              >
                Born from a passion for elegance, tradition, and modern innovation, Lucynex brings you a carefully curated collection of premium lifestyle products. As a trusted online destination in Bangladesh, we specialize in enchanting perfumes, authentic attar, and cutting-edge gadgets that elevate your everyday experience.
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.16 }}
              >
                Founded by Tanvir Ahmed, Lucynex blends timeless fragrance artistry with contemporary technology. Whether you're searching for long-lasting signature scents, pure traditional attar, or the latest smart gadgets, we ensure every product meets the highest standards of quality, authenticity, and style.
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.24 }}
              >
                Our mission is simple: to make luxury accessible and everyday life extraordinary. We are committed to delivering exceptional customer experience, genuine products, and complete satisfaction.
              </motion.p>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="light-card p-6 sm:p-8"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary mb-3">
              Brand Tagline
            </p>
            <p className="text-2xl sm:text-3xl font-bold leading-snug text-foreground">
              Glow. Scent. Style. — Our promise to you.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08 }}
            className="light-card p-6 sm:p-8 bg-primary/10 border-primary/20"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary mb-3">
              Luxury Experience
            </p>
            <p className="text-sm sm:text-base leading-7 text-foreground/80">
              Lucynex is built for customers who value authenticity, premium presentation, and reliable service. Every visit, every order, and every delivery is designed to feel polished, trustworthy, and memorable.
            </p>
          </motion.div>
        </section>
      </main>
    </div>
  );
}
