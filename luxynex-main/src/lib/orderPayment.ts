import { supabase } from "@/integrations/supabase/client";

export type PayMethod = "bkash" | "nagad";

export type StoredPaymentDetails = {
  sender_number: string;
  transaction_id: string;
  payment_type: PayMethod;
};

const PAYMENT_NOTE_PREFIX = "[Payment]";

export function isMissingColumnError(error: { message?: string; code?: string }) {
  const message = (error.message ?? "").toLowerCase();
  return (
    error.code === "PGRST204" ||
    message.includes("schema cache") ||
    message.includes("could not find") ||
    (message.includes("column") && message.includes("admin_orders"))
  );
}

export function parseStoredPaymentDetails(order: {
  sender_number?: string | null;
  transaction_id?: string | null;
  payment_details?: unknown;
  notes?: string | null;
}): StoredPaymentDetails | null {
  if (
    order.payment_details &&
    typeof order.payment_details === "object" &&
    !Array.isArray(order.payment_details)
  ) {
    const details = order.payment_details as Record<string, unknown>;
    if (
      typeof details.sender_number === "string" &&
      typeof details.transaction_id === "string"
    ) {
      return {
        sender_number: details.sender_number,
        transaction_id: details.transaction_id,
        payment_type:
          details.payment_type === "nagad" ? "nagad" : "bkash",
      };
    }
  }

  if (order.sender_number && order.transaction_id) {
    return {
      sender_number: order.sender_number,
      transaction_id: order.transaction_id,
      payment_type: "bkash",
    };
  }

  const noteMatch = order.notes?.match(/\[Payment\]\s*(\{[\s\S]*?\})/);
  if (noteMatch) {
    try {
      const parsed = JSON.parse(noteMatch[1]) as StoredPaymentDetails;
      if (parsed.sender_number && parsed.transaction_id) {
        return parsed;
      }
    } catch {
      return null;
    }
  }

  return null;
}

export async function submitOrderPaymentDetails(
  orderId: string,
  method: PayMethod,
  senderNumber: string,
  transactionId: string,
) {
  if (!orderId || orderId.trim() === "" || orderId === "undefined") {
    return {
      data: null,
      error: { message: "Missing order ID. Please reopen the payment page from checkout." },
    };
  }

  const paymentDetails: StoredPaymentDetails = {
    sender_number: senderNumber.trim(),
    transaction_id: transactionId.trim(),
    payment_type: method,
  };

  const baseUpdate = {
    payment_method: method,
    payment_status: "Pending Verification",
  };

  const columnResult = await supabase
    .from("admin_orders")
    .update({
      ...baseUpdate,
      sender_number: paymentDetails.sender_number,
      transaction_id: paymentDetails.transaction_id,
    })
    .eq("id", orderId)
    .select("order_number")
    .maybeSingle();

  if (!columnResult.error && columnResult.data) {
    return columnResult;
  }

  if (columnResult.error && !isMissingColumnError(columnResult.error)) {
    return columnResult;
  }

  const jsonResult = await supabase
    .from("admin_orders")
    .update({
      ...baseUpdate,
      payment_details: paymentDetails,
    })
    .eq("id", orderId)
    .select("order_number")
    .maybeSingle();

  if (!jsonResult.error && jsonResult.data) {
    return jsonResult;
  }

  if (jsonResult.error && !isMissingColumnError(jsonResult.error)) {
    return jsonResult;
  }

  const { data: existing, error: fetchError } = await supabase
    .from("admin_orders")
    .select("notes")
    .eq("id", orderId)
    .maybeSingle();

  if (fetchError) {
    return { data: null, error: fetchError };
  }

  if (!existing) {
    return {
      data: null,
      error: { message: "Order not found", code: "ORDER_NOT_FOUND" },
    };
  }

  const paymentNote = `${PAYMENT_NOTE_PREFIX} ${JSON.stringify(paymentDetails)}`;
  const notes = existing.notes
    ? `${existing.notes} | ${paymentNote}`
    : paymentNote;

  return supabase
    .from("admin_orders")
    .update({
      ...baseUpdate,
      notes,
    })
    .eq("id", orderId)
    .select("order_number")
    .maybeSingle();
}

export function getDisplayPaymentFields(order: {
  sender_number?: string | null;
  transaction_id?: string | null;
  payment_details?: unknown;
  notes?: string | null;
}) {
  const parsed = parseStoredPaymentDetails(order);
  return {
    senderNumber: parsed?.sender_number ?? order.sender_number ?? "—",
    transactionId: parsed?.transaction_id ?? order.transaction_id ?? "—",
  };
}
