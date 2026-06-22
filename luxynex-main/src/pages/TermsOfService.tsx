import { useEffect } from "react";
import SEO from "@/components/SEO";

export default function TermsOfService() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <SEO
        title="Terms of Service | Luxynex"
        description="Read the Luxynex Terms of Service covering website use, orders, account responsibilities, product information, and legal terms."
        url="/terms-of-service"
      />
      <div className="space-y-8">
        <header className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">
            Luxynex Legal
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold">Terms of Service</h1>
          <p className="text-sm text-muted-foreground">
            Effective Date: June 15, 2026
          </p>
        </header>

        <section className="light-card p-6 space-y-4 leading-7 text-sm sm:text-base text-foreground/90">
          <p>
            These Terms of Service govern your access to and use of the Luxynex
            website, mobile experience, order system, and customer support
            channels. By browsing the site, creating an account, or placing an
            order, you agree to be bound by these terms and any additional
            policies referenced on our website.
          </p>

          <div className="space-y-2">
            <h2 className="text-xl font-bold">1. Eligibility and Account Use</h2>
            <p>
              You must be able to form a legally binding contract under the laws
              of Bangladesh to use our services. If you create an account, you
              are responsible for maintaining the confidentiality of your login
              details and for all activity that occurs under your account. You
              agree to provide accurate and current information and to update it
              when necessary.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold">2. Product Listings and Availability</h2>
            <p>
              We aim to keep product descriptions, images, prices, and stock
              status accurate, but minor differences may occur due to lighting,
              display settings, supplier updates, or stock movements. Luxynex
              reserves the right to correct errors, update prices, change
              specifications, or discontinue products at any time without prior
              notice.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold">3. Orders and Acceptance</h2>
            <p>
              Placing an order does not guarantee acceptance. We may decline or
              cancel an order if a product is unavailable, if payment or
              delivery details cannot be verified, if we suspect fraud or abuse,
              or if an order violates these terms. If an order is canceled after
              payment, we will process a refund or alternative resolution as
              required by applicable law and our refund policy.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold">4. Pricing and Payments</h2>
            <p>
              All prices are shown in Bangladeshi Taka unless otherwise stated.
              Delivery fees, discounts, promotional offers, and taxes where
              applicable will be shown at checkout or in the order summary.
              Payment must be made using the methods we make available. You agree
              not to use any stolen, unauthorized, or fraudulent payment method.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold">5. Promotions and Coupon Codes</h2>
            <p>
              Promotional offers and coupon codes are subject to specific terms,
              expiration dates, usage limits, minimum purchase amounts, and
              eligibility rules. Luxynex may modify or cancel a promotion at any
              time if it has been misused, duplicated, or applied contrary to its
              stated conditions.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold">6. User Conduct</h2>
            <p>
              You agree not to misuse the website, interfere with its operation,
              attempt unauthorized access, upload malicious content, scrape data
              without permission, or use the platform for unlawful purposes. We
              may suspend or terminate access if we believe these terms have been
              violated.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold">7. Intellectual Property</h2>
            <p>
              All site content, including text, visuals, branding, product
              descriptions, graphics, code, and logos, is owned by Luxynex or
              its licensors and is protected by intellectual property laws. You
              may not reproduce, distribute, or commercially exploit our content
              without written permission.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold">8. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by law, Luxynex will not be liable
              for indirect, incidental, special, or consequential damages arising
              from your use of the site, delays in delivery, service outages, or
              reliance on site content. Nothing in these terms excludes liability
              that cannot be limited under applicable law.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold">9. Changes to These Terms</h2>
            <p>
              We may update these Terms of Service from time to time. The latest
              version will always be posted on this page. Continued use of the
              website after changes are posted means you accept the updated
              terms.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold">10. Governing Law and Contact</h2>
            <p>
              These terms are governed by the laws of Bangladesh. If you have
              questions about these Terms of Service, please contact Luxynex
              through our customer support channels or the Contact page on the
              website.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}