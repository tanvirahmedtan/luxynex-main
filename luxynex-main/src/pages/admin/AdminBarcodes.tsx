import { useEffect, useRef, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Download, FileImage } from "lucide-react";
import JsBarcode from "jsbarcode";
import jsPDF from "jspdf";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type Product = Tables<"admin_products">;

function makeBarcodeDataUrl(value: string) {
  const canvas = document.createElement("canvas");
  JsBarcode(canvas, value, {
    format: "CODE128",
    width: 2,
    height: 60,
    displayValue: true,
    fontSize: 14,
    margin: 6,
  });
  return canvas.toDataURL("image/png");
}

export default function AdminBarcodes() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase
      .from("admin_products")
      .select("*")
      .order("name")
      .then((r) => setProducts(r.data || []));
  }, []);

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.sku || "").toLowerCase().includes(search.toLowerCase()),
  );

  const toggle = (id: string) => {
    const s = new Set(selected);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelected(s);
  };
  const toggleAll = () =>
    setSelected(
      selected.size === filtered.length
        ? new Set()
        : new Set(filtered.map((p) => p.id)),
    );

  const downloadPng = (p: Product) => {
    const code = p.sku || p.id.slice(0, 12);
    const url = makeBarcodeDataUrl(code);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${p.name}-${code}.png`;
    a.click();
  };

  const downloadPdf = () => {
    const items = products.filter((p) => selected.has(p.id));
    if (items.length === 0) {
      toast.error("Select at least one product");
      return;
    }
    const pdf = new jsPDF({ unit: "mm", format: "a4" });
    const pageW = 210,
      pageH = 297;
    const cols = 3,
      rows = 8;
    const cellW = (pageW - 20) / cols;
    const cellH = (pageH - 20) / rows;
    items.forEach((p, i) => {
      const idx = i % (cols * rows);
      if (i > 0 && idx === 0) pdf.addPage();
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      const x = 10 + col * cellW;
      const y = 10 + row * cellH;
      const code = p.sku || p.id.slice(0, 12);
      const img = makeBarcodeDataUrl(code);
      pdf.setFontSize(8);
      pdf.text(p.name.slice(0, 28), x + 2, y + 5);
      pdf.text(`৳${Number(p.price)}`, x + 2, y + 10);
      pdf.addImage(img, "PNG", x + 2, y + 12, cellW - 4, cellH - 18);
    });
    pdf.save("barcodes.pdf");
  };

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <h1 className="text-2xl font-bold text-foreground">
            Download Barcodes
          </h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={toggleAll}>
              {selected.size === filtered.length ? "Clear" : "Select All"}
            </Button>
            <Button onClick={downloadPdf}>
              <Download className="w-4 h-4 mr-1" />
              Download PDF ({selected.size})
            </Button>
          </div>
        </div>
        <Input
          placeholder="Search by name or SKU…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />

        <Card>
          <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.length === 0 ? (
              <p className="text-center text-muted-foreground py-8 col-span-full">
                No products
              </p>
            ) : (
              filtered.map((p) => {
                const code = p.sku || p.id.slice(0, 12);
                return (
                  <div
                    key={p.id}
                    className="border rounded-lg p-3 flex flex-col gap-2"
                  >
                    <div className="flex items-start gap-2">
                      <Checkbox
                        checked={selected.has(p.id)}
                        onCheckedChange={() => toggle(p.id)}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{p.name}</p>
                        <p className="text-xs text-muted-foreground">
                          ৳{Number(p.price)} · stock {p.stock}
                        </p>
                      </div>
                    </div>
                    <img
                      src={makeBarcodeDataUrl(code)}
                      alt={code}
                      className="w-full h-20 object-contain bg-white border rounded"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => downloadPng(p)}
                    >
                      <FileImage className="w-3 h-3 mr-1" />
                      PNG
                    </Button>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
        <div ref={previewRef} className="hidden" />
      </div>
    </AdminLayout>
  );
}
