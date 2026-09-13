import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import CheckoutPage from "../pages/CheckoutPage";

const { mockNavigate, mockRpc, mockClearCart, mockToastError, mockToastSuccess } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockRpc: vi.fn(),
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
        "/track-order?order=LXV-12345",
        { replace: true },
      );
    });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /confirm order/i })).toBeEnabled();
    });
  });
});
