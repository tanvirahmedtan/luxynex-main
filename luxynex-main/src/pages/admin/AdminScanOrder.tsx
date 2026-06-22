import { useEffect, useRef, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Camera, ScanLine, X } from "lucide-react";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type Order = Tables<"admin_orders">;
const STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;

export default function AdminScanOrder() {
  const [orderNumber, setOrderNumber] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<string>("shipped");
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const lookup = async (num: string) => {
    const code = num.trim();
    if (!code) return;
    const { data, error } = await supabase
      .from("admin_orders")
      .select("*")
      .eq("order_number", code)
      .maybeSingle();
    if (error || !data) {
      toast.error("Order not found");
      setOrder(null);
      return;
    }
    setOrder(data);
    setNewStatus(data.status);
    toast.success(`Loaded ${data.order_number}`);
  };

  const update = async () => {
    if (!order) return;
    const { error } = await supabase
      .from("admin_orders")
      .update({ status: newStatus as Order["status"] })
      .eq("id", order.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`Marked ${order.order_number} as ${newStatus}`);
    setOrder(null);
    setOrderNumber("");
    inputRef.current?.focus();
  };

  const startScan = async () => {
    setScanning(true);
    const { Html5Qrcode } = await import("html5-qrcode");
    setTimeout(async () => {
      try {
        const scanner = new Html5Qrcode("reader");
        scannerRef.current = scanner;
        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: 250 },
          (text) => {
            setOrderNumber(text);
            stopScan();
            lookup(text);
          },
          () => {},
        );
      } catch (e: any) {
        toast.error(e.message || "Camera failed");
        setScanning(false);
      }
    }, 100);
  };

  const stopScan = async () => {
    try {
      await scannerRef.current?.stop();
      await scannerRef.current?.clear();
    } catch {}
    scannerRef.current = null;
    setScanning(false);
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-2xl">
        <h1 className="text-2xl font-bold text-foreground">Scan to Update</h1>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ScanLine className="w-4 h-4 text-primary" />
              Order Lookup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Order Number (scan or type)</Label>
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={orderNumber}
                  placeholder="LXV-..."
                  onChange={(e) => setOrderNumber(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && lookup(orderNumber)}
                />
                <Button onClick={() => lookup(orderNumber)}>Find</Button>
                <Button
                  variant="outline"
                  onClick={scanning ? stopScan : startScan}
                >
                  {scanning ? (
                    <>
                      <X className="w-4 h-4 mr-1" />
                      Stop
                    </>
                  ) : (
                    <>
                      <Camera className="w-4 h-4 mr-1" />
                      Camera
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Tip: USB barcode scanners type the code + Enter automatically.
              </p>
            </div>
            {scanning && (
              <div
                id="reader"
                className="w-full rounded-lg overflow-hidden border"
              />
            )}
          </CardContent>
        </Card>

        {order && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Order {order.order_number}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <span className="text-muted-foreground">Customer:</span>{" "}
                <strong>{order.customer_name}</strong> · {order.customer_phone}
              </div>
              <div>
                <span className="text-muted-foreground">Total:</span>{" "}
                <strong>৳{Number(order.total)}</strong> ·{" "}
                <Badge>{order.payment_method}</Badge>
              </div>
              <div>
                <span className="text-muted-foreground">Current status:</span>{" "}
                <Badge>{order.status}</Badge>
              </div>
              <div className="space-y-2 pt-2">
                <Label>Update Status</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s} value={s} className="capitalize">
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button className="w-full" onClick={update}>
                  Update Order
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
