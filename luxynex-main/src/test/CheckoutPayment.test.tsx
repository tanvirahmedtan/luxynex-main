import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import CheckoutPayment from "../pages/CheckoutPayment";

const { mockRpc, mockFrom } = vi.hoisted(() => ({
  mockRpc: vi.fn(),
  mockFrom: vi.fn(),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    rpc: mockRpc,
    from: mockFrom,
  },
}));

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe("CheckoutPayment", () => {
  it("redirects back to checkout when the order ID is missing", async () => {
    render(
      <MemoryRouter initialEntries={["/checkout/payment"]}>
        <Routes>
          <Route path="/checkout/payment" element={<CheckoutPayment />} />
          <Route path="/checkout" element={<div>Checkout page</div>} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("Checkout page")).toBeInTheDocument();
    });
  });

  it("uses the order ID from the payment URL when navigation state is unavailable", async () => {
    mockRpc.mockResolvedValue({ error: null });
    mockFrom.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn().mockResolvedValue({
            data: { order_number: "LXV-12345" },
            error: null,
          }),
        })),
      })),
    });

    render(
      <MemoryRouter
        initialEntries={[{
          pathname: "/checkout/payment/order-1",
          state: {
            pendingOrder: {
              items: [],
              customer_name: "Test User",
              customer_phone: "01712345678",
              customer_email: "test@example.com",
              shipping_address: "123 Test Street, Dhaka",
              subtotal: 100,
              shipping_fee: 80,
              discount: 0,
              total: 180,
              notes: "",
            },
          },
        }]}
      >
        <Routes>
          <Route path="/checkout/payment/:orderId" element={<CheckoutPayment />} />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByPlaceholderText("01XXXXXXXXX"), {
      target: { value: "01712345678" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter your TrxID"), {
      target: { value: "TRX-123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /submit payment details/i }));

    await waitFor(() => {
      expect(mockRpc).toHaveBeenCalledWith("submit_order_payment_details", {
        p_order_id: "order-1",
        p_payment_method: "bkash",
        p_sender_number: "01712345678",
        p_transaction_id: "TRX-123",
      });
    });
  });
});
