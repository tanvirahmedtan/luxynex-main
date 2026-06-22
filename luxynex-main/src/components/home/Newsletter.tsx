import { useState } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  return (
    <section className="light-card p-6 sm:p-10 rounded-2xl text-center">
      <h2 className="text-xl font-bold text-foreground mb-2">
        Stay in the Loop
      </h2>
      <p className="text-sm text-muted-foreground mb-6">
        Subscribe for exclusive deals, new arrivals & more ✨
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (email) {
            toast.success("Subscribed successfully!");
            setEmail("");
          }
        }}
        className="flex gap-2 max-w-md mx-auto"
      >
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="your@email.com"
          className="flex-1 bg-muted rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          required
        />
        <button
          type="submit"
          className="primary-btn px-5 py-2.5 text-sm flex items-center gap-2"
        >
          <Send className="w-4 h-4" /> Subscribe
        </button>
      </form>
    </section>
  );
}
