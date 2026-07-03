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
        title="About Luxynex — Premium Lifestyle Store in Bangladesh"
        description="Learn more about Luxynex, a premium lifestyle destination in Bangladesh for perfumes, attar, and modern gadgets."
        url="/about"
      />
      <main className="container mx-auto px-4 py-10 sm:py-14 max-w-5xl">
        <section className="relative overflow-hidden rounded-[2rem] border border-black/10 bg-white px-6 py-10 text-foreground shadow-sm sm:px-10 sm:py-14">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.08),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(0,0,0,0.02),transparent_30%)]" />
          <div className="relative space-y-6">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
              About
            </p>
            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl sm:text-5xl font-bold leading-tight"
            >
              About Luxynex
            </motion.h1>
            <div className="max-w-3xl space-y-4 text-sm sm:text-base leading-8 text-foreground/80">
              <motion.p
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 }}
              >
                <strong>LUXYNEX</strong> is a premium lifestyle brand in Bangladesh, specializing in <strong>luxury perfumes, authentic attar, and smart gadgets</strong>. Born from a passion for elegance, tradition, and modern innovation, we bring together high-quality fragrances and trending technology to elevate your everyday lifestyle.
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.16 }}
              >
                As a trusted online store in Bangladesh, LUXYNEX offers a carefully curated collection of <strong>premium perfumes, long-lasting attar, smart home gadgets, RGB lights, and lifestyle products</strong>. Whether you are looking for signature scents, traditional attar, or the latest smart gadgets, we provide authentic products that meet international quality standards.
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.24 }}
              >
                Founded by Tanvir Ahmed, LUXYNEX combines timeless fragrance artistry with contemporary innovation. We are committed to delivering genuine luxury perfumes, pure attar, and premium gadgets at the best prices in Bangladesh. Our goal is to make premium lifestyle products accessible to every Bangladeshi customer.
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.32 }}
              >
                At LUXYNEX, customer satisfaction is our top priority. We ensure fast delivery across Bangladesh, secure payment options, and 100% genuine products. Discover the perfect blend of scent, style, and smart living with LUXYNEX — your ultimate destination for luxury perfumes, attar, and gadgets in Bangladesh.
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
              Luxynex is built for customers who value authenticity, premium presentation, and reliable service. Every visit, every order, and every delivery is designed to feel polished, trustworthy, and memorable.
            </p>
          </motion.div>
        </section>
      </main>
    </div>
  );
}
