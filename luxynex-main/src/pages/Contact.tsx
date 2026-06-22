import { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  MessageCircle,
  Facebook,
  Instagram,
  Music2,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import SEO from "@/components/SEO";
import {
  SOCIAL_LINKS,
  WHATSAPP_URL,
  WHATSAPP_NUMBER,
  BUSINESS_EMAIL,
} from "@/lib/contact";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Message sent! We'll get back to you soon.");
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Contact Luxynex — Customer Support in Bangladesh"
        description="Reach Luxynex via WhatsApp, email or our contact form. Friendly support for gadgets, attar and perfume orders across Bangladesh."
        url="/contact"
      />
      <main className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold text-foreground text-center mb-8">
          Get in Touch
        </h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <motion.form
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onSubmit={handleSubmit}
            className="light-card p-6 space-y-4"
          >
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Your Name"
              className="w-full bg-muted rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40"
            />
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="Your Email"
              className="w-full bg-muted rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40"
            />
            <textarea
              required
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="Your Message"
              rows={5}
              className="w-full bg-muted rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40 resize-none"
            />
            <button type="submit" className="primary-btn w-full py-3 text-sm">
              Send Message
            </button>
          </motion.form>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="light-card-hover p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Email</p>
                <a
                  href={`mailto:${BUSINESS_EMAIL}`}
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  {BUSINESS_EMAIL}
                </a>
              </div>
            </div>
            <div className="light-card-hover p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#25D366]/10 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-[#25D366]" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">WhatsApp</p>
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  {WHATSAPP_NUMBER}
                </a>
              </div>
            </div>
            <div className="light-card-hover p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Address</p>
                <p className="text-sm text-muted-foreground">
                  Dhaka, Bangladesh
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <a
                href={SOCIAL_LINKS.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="light-card-hover p-4 flex flex-col items-center justify-center gap-1 text-xs font-medium text-[#1877F2]"
              >
                <Facebook className="w-5 h-5" /> Facebook
              </a>
              <a
                href={SOCIAL_LINKS.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="light-card-hover p-4 flex flex-col items-center justify-center gap-1 text-xs font-medium text-[#E1306C]"
              >
                <Instagram className="w-5 h-5" /> Instagram
              </a>
              <a
                href={SOCIAL_LINKS.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="light-card-hover p-4 flex flex-col items-center justify-center gap-1 text-xs font-medium text-foreground"
              >
                <Music2 className="w-5 h-5" /> TikTok
              </a>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
