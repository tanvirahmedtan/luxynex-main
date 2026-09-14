import HeroSlider from "@/components/home/HeroSlider";
import CategorySidebar from "@/components/home/CategorySidebar";
import TrendingStrip from "@/components/home/TrendingStrip";
import CategorySections from "@/components/home/CategorySections";
import MobileCategories from "@/components/home/MobileCategories";
import ReviewMarquee from "@/components/home/ReviewMarquee";
import Newsletter from "@/components/home/Newsletter";
import BackToTop from "@/components/BackToTop";
import CookieConsent from "@/components/CookieConsent";
import PromoPopup from "@/components/PromoPopup";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import SEO from "@/components/SEO";

export default function Index() {
  return (
    <>
      <SEO
        url="/"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Luxynex",
          url: "https://luxynex.lovable.app",
          logo: "https://www.luxynex.shop/assets/luxynex-logo.svg",
          publisher: {
            "@type": "Organization",
            name: "Luxynex",
            logo: {
              "@type": "ImageObject",
              url: "https://www.luxynex.shop/assets/luxynex-logo.svg",
            },
          },
          potentialAction: {
            "@type": "SearchAction",
            target: "https://luxynex.lovable.app/shop?q={search_term_string}",
            "query-input": "required name=search_term_string",
          },
        }}
      />
      <div className="container mx-auto px-4 py-6 space-y-10">
        {/* Hero + Category Sidebar */}
        <section className="-mx-4 flex items-stretch gap-4 sm:mx-0">
          <aside className="hidden w-[250px] flex-shrink-0 lg:block lg:self-stretch">
            <CategorySidebar />
          </aside>
          <div className="min-w-0 flex-1 lg:h-[380px] xl:h-[420px] 2xl:h-[460px]">
            <HeroSlider />
          </div>
        </section>

        <MobileCategories />

        <TrendingStrip />

        {/* Products by Category */}
        <CategorySections />

        <ReviewMarquee />
        <Newsletter />
      </div>
      <BackToTop />
      <WhatsAppFloat />
      <CookieConsent />
      <PromoPopup />
    </>
  );
}
