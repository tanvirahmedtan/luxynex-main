import { useState } from "react";
import { X } from "lucide-react";

export default function CookieConsent() {
  const [show, setShow] = useState(
    () => !localStorage.getItem("cookie-consent"),
  );
  if (!show) return null;
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <div className="container mx-auto light-card p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
        <p className="text-sm text-muted-foreground">
          We use cookies to enhance your experience. By continuing, you agree to
          our cookie policy.
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => {
              localStorage.setItem("cookie-consent", "1");
              setShow(false);
            }}
            className="primary-btn px-4 py-2 text-sm"
          >
            Accept
          </button>
          <button
            onClick={() => setShow(false)}
            className="p-2 hover:bg-muted rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
