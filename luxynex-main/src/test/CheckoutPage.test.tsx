import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import CheckoutPage from "../pages/CheckoutPage";

const { mockNavigate, mockRpc, mockFrom, mockClearCart, mockToastError, mockToastSuccess } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockRpc: vi.fn(),
  mockFrom: vi.fn(),
  mockClearCart: vi.fn(),
  mockToastError: vi.fn(),
  mockToastSuccess: vi.fn(),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("@/contexts/CartContext", async () => {
  const actual = await vi.importActual<typeof import("@/contexts/CartContext")>("@/contexts/CartContext");
  return {
    ...actual,
    useCart: () => ({
      items: [
        {
          product: {
            id: "prod-1",
            name: "Test Product",
            price: 100,
            image: "test.png",
            description: "desc",
            category: "test",
            rating: 5,
            reviews: 1,
            isNew: false,
            inStock: true,
            sizes: [],
            colors: [],
          },
          quantity: 1,
          selectedVariant: null,
        },
      ],
      subtotal: 100,
      discountAmount: 0,
      appliedCoupon: null,
      clearCart: mockClearCart,
      promoCode: "",
      setPromoCode: vi.fn(),
      couponLoading: false,
      applyPromo: vi.fn(),
      totalItems: 1,
    }),
  };
});

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: { id: "user-1", email: "test@example.com" },
    profile: { full_name: "Test User", phone: "01700000000" },
    loading: false,
  }),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    rpc: mockRpc,
    from: mockFrom,
  },
}));

vi.mock("sonner", () => ({
  toast: {
    error: mockToastError,
    success: mockToastSuccess,
  },
}));

describe("CheckoutPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRpc.mockResolvedValue({
      data: [{ id: "order-1", order_number: "LXV-12345" }],
      error: null,
    });
    mockFrom.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        })),
      })),
    });
  });

  it("resets the loading state and redirects after a successful COD order", async () => {
    render(
      <MemoryRouter>
        <CheckoutPage />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByPlaceholderText("Enter your full name"), {
      target: { value: "Test User" },
    });
    fireEvent.change(screen.getByPlaceholderText("+880 1XXXXXXXXX"), {
      target: { value: "01712345678" },
    });
    fireEvent.change(screen.getByPlaceholderText("123, ABC Road, House #45"), {
      target: { value: "123 Test Street" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter your city"), {
      target: { value: "Dhaka" },
    });

    fireEvent.click(screen.getByRole("button", { name: /cash on delivery/i }));
    fireEvent.click(screen.getByRole("button", { name: /confirm order/i }));

    expect(screen.getByRole("button", { name: /placing order/i })).toBeDisabled();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        "/order-success?order=LXV-12345&phone=01712345678&orderId=order-1",
        { replace: true },
      );
    });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /confirm order/i })).toBeEnabled();
    });
  });

  it("uses the production RPC signature and preserves checkout details in notes", async () => {
    render(
      <MemoryRouter>
        <CheckoutPage />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByPlaceholderText("Enter your full name"), {
      target: { value: "Test User" },
    });
    fireEvent.change(screen.getByPlaceholderText("+880 1XXXXXXXXX"), {
      target: { value: "01712345678" },
    });
    fireEvent.change(screen.getByPlaceholderText("123, ABC Road, House #45"), {
      target: { value: "123 Test Street" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter your city"), {
      target: { value: "Dhaka" },
    });

    fireEvent.click(screen.getByRole("button", { name: /confirm order/i }));

    await waitFor(() => {
      expect(mockRpc).toHaveBeenCalledWith(
        "place_order",
        expect.objectContaining({
          p_customer_name: "Test User",
          p_customer_phone: "01712345678",
          p_shipping_address: "123 Test Street, Dhaka",
          p_shipping_fee: 80,
          p_promo_discount_percent: 0,
          p_payment_method: "bkash",
          p_notes: expect.stringContaining("City: Dhaka"),
        }),
      );

      const [, payload] = mockRpc.mock.calls.at(-1) as [string, Record<string, unknown>];
      expect(payload).not.toHaveProperty("p_city");
      expect(payload).not.toHaveProperty("p_delivery_zone");
      expect(payload).not.toHaveProperty("p_payment_type");
    });
  });

  it("redirects online payments with the returned order ID", async () => {
    render(
      <MemoryRouter>
        <CheckoutPage />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByPlaceholderText("Enter your full name"), {
      target: { value: "Test User" },
    });
    fireEvent.change(screen.getByPlaceholderText("+880 1XXXXXXXXX"), {
      target: { value: "01712345678" },
    });
    fireEvent.change(screen.getByPlaceholderText("123, ABC Road, House #45"), {
      target: { value: "123 Test Street" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter your city"), {
      target: { value: "Dhaka" },
    });

    fireEvent.click(screen.getByRole("button", { name: /confirm order/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        "/checkout/payment?orderId=order-1",
        expect.objectContaining({
          replace: true,
          state: expect.objectContaining({ orderId: "order-1" }),
        }),
      );
    });
  });

  it("does not navigate when the backend omits the order ID", async () => {
    mockRpc.mockResolvedValueOnce({
      data: [{ order_number: "LXV-12345" }],
      error: null,
    });

    render(
      <MemoryRouter>
        <CheckoutPage />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByPlaceholderText("Enter your full name"), {
      target: { value: "Test User" },
    });
    fireEvent.change(screen.getByPlaceholderText("+880 1XXXXXXXXX"), {
      target: { value: "01712345678" },
    });
    fireEvent.change(screen.getByPlaceholderText("123, ABC Road, House #45"), {
      target: { value: "123 Test Street" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter your city"), {
      target: { value: "Dhaka" },
    });
    fireEvent.click(screen.getByRole("button", { name: /confirm order/i }));

    await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith(
          "We couldn't place your order. Please check your details and try again.",
        );
    });
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("accepts an object-shaped RPC response and redirects with its order ID", async () => {
    mockRpc.mockResolvedValueOnce({
      data: { id: "order-object", order_number: "LXV-67890" },
      error: null,
    });

    render(
      <MemoryRouter>
        <CheckoutPage />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByPlaceholderText("Enter your full name"), {
      target: { value: "Test User" },
    });
    fireEvent.change(screen.getByPlaceholderText("+880 1XXXXXXXXX"), {
      target: { value: "01712345678" },
    });
    fireEvent.change(screen.getByPlaceholderText("123, ABC Road, House #45"), {
      target: { value: "123 Test Street" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter your city"), {
      target: { value: "Dhaka" },
    });
    fireEvent.click(screen.getByRole("button", { name: /confirm order/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        "/checkout/payment?orderId=order-object",
        expect.objectContaining({ replace: true }),
      );
    });
  });

  it("recovers the ID when the RPC only returns an order number", async () => {
    mockRpc.mockResolvedValueOnce({
      data: [{ order_number: "LXV-24680" }],
      error: null,
    });
    mockFrom.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn().mockResolvedValue({
            data: { id: "recovered-order", order_number: "LXV-24680" },
            error: null,
          }),
        })),
      })),
    });

    render(
      <MemoryRouter>
        <CheckoutPage />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByPlaceholderText("Enter your full name"), {
      target: { value: "Test User" },
    });
    fireEvent.change(screen.getByPlaceholderText("+880 1XXXXXXXXX"), {
      target: { value: "01712345678" },
    });
    fireEvent.change(screen.getByPlaceholderText("123, ABC Road, House #45"), {
      target: { value: "123 Test Street" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter your city"), {
      target: { value: "Dhaka" },
    });
    fireEvent.click(screen.getByRole("button", { name: /confirm order/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        "/checkout/payment?orderId=recovered-order",
        expect.objectContaining({ replace: true }),
      );
    });
    expect(mockFrom).toHaveBeenCalledWith("admin_orders");
  });
});
