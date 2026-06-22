import { useEffect } from "react";
import SEO from "@/components/SEO";

export default function ReturnAndRefund() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <SEO
        title="Return & Refund Policy | Luxynex"
        description="Understand Luxynex return, refund, exchange, and cancellation rules for premium gadgets, attar, and perfumes in Bangladesh."
        url="/return-and-refund"
      />
      <div className="space-y-8">
        <header className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">
            Luxynex Legal
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold">
            Return & Refund Policy
          </h1>
          <p className="text-sm text-muted-foreground">
            Effective Date: June 15, 2026
          </p>
        </header>

        <section className="light-card p-6 space-y-4 leading-7 text-sm sm:text-base text-foreground/90">
          <p>
            Luxynex is committed to delivering premium products and a reliable
            customer experience. This Return & Refund Policy explains when you
            may request a return, exchange, replacement, or refund for items
            purchased from our website or through our authorized sales channels.
          </p>

          <div className="space-y-2">
            <h2 className="text-xl font-bold">1. General Return Window</h2>
            <p>
              Where a return is eligible, requests should be made within 7 days
              of delivery unless a different product-specific rule is listed at
              purchase time. Items must be unused, in original condition, and
              returned with all accessories, packaging, manuals, tags, and any
              included gifts or promotional items.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold">2. Non-Returnable Items</h2>
            <p>
              For hygiene, safety, and product integrity reasons, certain items
              may not be eligible for return once opened or used. This may
              include perfumes, attars, personal care items, sealed consumables,
              clearance items, gift cards, and other products marked as
              non-returnable at the time of sale. If a product is defective or
              incorrect, please contact us promptly so we can review the case.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold">3. Damaged, Defective, or Wrong Items</h2>
            <p>
              If you receive a damaged, defective, missing, or incorrect item,
              notify Luxynex as soon as possible after delivery with clear
              photos and order details. Once verified, we may arrange a return,
              exchange, replacement, or refund depending on the situation and
              product availability.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold">4. Refund Eligibility</h2>
            <p>
              Approved refunds are typically issued to the original payment
              method or another method we mutually agree on where permitted.
              Shipping fees, cash-on-delivery handling costs, and non-recoverable
              charges may not be refundable unless the issue was caused by us or
              the product was defective, incorrect, or undelivered.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold">5. Refund Processing Time</h2>
            <p>
              Refund processing times vary by payment method and financial
              institution. Once approved, refunds are usually processed within a
              reasonable period after the return is inspected and accepted. Delays
              from banks, mobile financial services, or card providers are beyond
              our control but we will assist where possible.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold">6. Exchange Policy</h2>
            <p>
              Exchanges may be offered for size, color, or model variations when
              stock is available. Exchange requests are subject to inspection and
              product availability. If an exchange is not possible, we may offer
              an alternative remedy or refund according to this policy.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold">7. Order Cancellations</h2>
            <p>
              Orders may be canceled before dispatch where feasible. Once an
              order has been packed, handed over to a courier, or marked as
              shipped, cancellation may not be possible and the return policy will
              apply after delivery. Custom, made-to-order, or reserved items may
              not be cancellable.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold">8. Return Shipping and Inspection</h2>
            <p>
              Customers may be responsible for return shipping unless the return
              is due to our error or a verified product defect. All returns are
              inspected upon receipt. If a returned item shows signs of misuse,
              missing parts, physical damage, or altered packaging, the request
              may be rejected or partially refunded where legally permitted.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold">9. Promotional Purchases</h2>
            <p>
              Products bought with a coupon, bundle offer, or promotional gift
              may be refunded based on the actual amount paid after discount.
              Promotional gifts or bundle benefits may need to be returned as
              well if they were part of the original purchase terms.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold">10. Contact for Returns</h2>
            <p>
              To request a return or refund, contact Luxynex with your order
              number, contact number, reason for the request, and supporting
              photos if applicable. Our support team will review the request and
              guide you through the next steps.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}