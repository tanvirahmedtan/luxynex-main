import { useState } from "react";
import { X } from "lucide-react";

export default function CookieConsent() {
  const [show, setShow] = useState(
    () => !localStorage.getItem("cookie-consent"),
  );
  if (!show) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] p-3 pb-[calc(4.75rem+env(safe-area-inset-bottom))] sm:p-4 sm:pb-4">
      <div className="light-card container mx-auto flex max-w-3xl flex-col items-start justify-between gap-3 p-4 shadow-lg sm:flex-row sm:items-center">
        <p className="text-sm leading-relaxed text-muted-foreground">
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
