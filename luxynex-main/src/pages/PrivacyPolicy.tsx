import { useEffect } from "react";
import SEO from "@/components/SEO";

export default function PrivacyPolicy() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <SEO
        title="Privacy Policy | Luxynex"
        description="Learn how Luxynex collects, uses, stores, and protects customer information across our website, checkout, and support channels."
        url="/privacy-policy"
      />
      <div className="space-y-8">
        <header className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">
            Luxynex Legal
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground">
            Effective Date: June 15, 2026
          </p>
        </header>

        <section className="light-card p-6 space-y-4 leading-7 text-sm sm:text-base text-foreground/90">
          <p>
            Luxynex respects your privacy and is committed to protecting the
            personal information you share with us. This Privacy Policy explains
            how we collect, use, disclose, store, and safeguard information when
            you visit our website, create an account, place an order, contact us,
            or interact with our promotional messages and support channels.
          </p>
          <p>
            By using our website or purchasing from Luxynex, you agree to the
            collection and use of information in accordance with this policy.
            If you do not agree, please do not use our services.
          </p>

          <div className="space-y-2">
            <h2 className="text-xl font-bold">1. Information We Collect</h2>
            <p>
              We may collect information you provide directly, such as your
              name, phone number, email address, delivery address, billing
              details, account credentials, order notes, and support messages.
              We also collect information automatically, including device type,
              browser information, IP address, pages visited, referral source,
              and basic usage analytics to help us improve site performance and
              user experience.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold">2. How We Use Your Information</h2>
            <p>
              Luxynex uses your information to process orders, deliver products,
              handle payments, send order confirmations and status updates,
              provide customer support, prevent fraud, improve our website,
              personalize product recommendations, and comply with legal or tax
              obligations. We may also use your contact information to send you
              promotional offers, new arrival announcements, and other marketing
              communications where permitted by law and your preferences.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold">3. Payment and Order Processing</h2>
            <p>
              Payment information is processed through trusted third-party
              payment or order-processing providers. Luxynex does not sell your
              personal data. We only share the information needed to complete the
              transaction, verify the order, arrange delivery, prevent fraud, or
              meet regulatory requirements.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold">4. Sharing of Information</h2>
            <p>
              We may share your information with delivery partners, payment
              processors, analytics providers, technical service providers, and
              legal or regulatory authorities when necessary. These parties are
              expected to handle your data securely and use it only for the
              agreed purpose.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold">5. Data Retention and Security</h2>
            <p>
              We retain order and account information for as long as necessary to
              fulfill the purposes described in this policy, comply with legal
              obligations, resolve disputes, and support business operations. We
              take reasonable administrative, technical, and physical safeguards
              to protect your information, but no method of transmission or
              storage is completely secure.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold">6. Cookies and Tracking</h2>
            <p>
              Luxynex may use cookies and similar technologies to remember your
              preferences, keep your cart active, improve site performance, and
              analyze traffic. You can control cookies through your browser
              settings, but disabling them may affect certain site features.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold">7. Your Rights</h2>
            <p>
              Depending on applicable law, you may have the right to access,
              correct, or request deletion of certain personal information, and
              to opt out of marketing communications. You can contact us using
              the details below to make a privacy request. We may need to retain
              certain information where required for legitimate business or legal
              reasons.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold">8. Children&apos;s Privacy</h2>
            <p>
              Our website is intended for general consumer use and is not
              directed to children under 13. We do not knowingly collect
              personal information from children. If you believe a child has
              provided us with personal data, please contact us so we can review
              and delete it where appropriate.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold">9. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time to reflect
              operational, legal, or regulatory changes. The revised version will
              be posted on this page with an updated effective date.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold">10. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy or how Luxynex
              handles your personal information, please contact our support team
              through the website contact page, WhatsApp support, or our official
              email address.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}