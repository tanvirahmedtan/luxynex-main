import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Popup = Tables<"admin_popups">;

export default function PromoPopup() {
  const [popup, setPopup] = useState<Popup | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("admin_popups")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!data) return;
      const dismissedId = sessionStorage.getItem("popup_dismissed");
      if (dismissedId === data.id) return;
      setPopup(data);
      setTimeout(() => setShow(true), 1500);
    };
    load();
  }, []);

  const close = () => {
    if (popup) sessionStorage.setItem("popup_dismissed", popup.id);
    setShow(false);
  };

  if (!popup || !show) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 animate-in fade-in"
      onClick={close}
    >
      <div
        className="bg-background rounded-2xl shadow-2xl max-w-md w-full overflow-hidden relative animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={close}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-background/80 backdrop-blur flex items-center justify-center hover:bg-muted"
        >
          <X className="w-4 h-4" />
        </button>
        {popup.image_url && (
          <img
            src={popup.image_url}
            alt={popup.title}
            className="w-full h-48 object-cover"
          />
        )}
        <div className="p-6 text-center space-y-3">
          <h2 className="text-2xl font-bold text-foreground">{popup.title}</h2>
          {popup.description && (
            <p className="text-muted-foreground text-sm">{popup.description}</p>
          )}
          {popup.button_text && popup.button_link && (
            <Link
              to={popup.button_link}
              onClick={close}
              className="inline-block primary-btn px-6 py-3 text-sm mt-2"
            >
              {popup.button_text}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
