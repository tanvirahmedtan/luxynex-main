import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import ProductPage from "../pages/ProductPage";

const { mockAddToCart, mockNavigate, mockProducts } = vi.hoisted(() => ({
  mockAddToCart: vi.fn(),
  mockNavigate: vi.fn(),
  mockProducts: [
    {
      id: "prod-1",
      name: "Test Product",
      price: 1000,
      originalPrice: 1200,
      image: "test.png",
      images: ["test.png"],
      description: "desc",
      category: "test",
      subcategory: "test",
      rating: 5,
      reviews: 1,
      stock: "in-stock",
      stockCount: 10,
      sku: "SKU-1",
      colors: ["Black"],
      sizes: ["XL"],
      variants: [],
      attributes: [],
    },
  ],
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("@/hooks/useProducts", () => ({
  useProducts: () => ({ products: mockProducts, loading: false }),
}));

vi.mock("@/contexts/CartContext", () => ({
  useCart: () => ({
    addToCart: mockAddToCart,
    clearCart: vi.fn(),
  }),
}));

vi.mock("@/contexts/WishlistContext", () => ({
  useWishlist: () => ({
    isInWishlist: () => false,
    addToWishlist: vi.fn(),
    removeFromWishlist: vi.fn(),
  }),
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: null }),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: () => ({
      select: () => Promise.resolve({ data: [], error: null }),
    }),
  },
}));

vi.mock("@/components/SEO", () => ({
  default: () => null,
}));

vi.mock("@/components/WhatsAppFloat", () => ({
  default: () => null,
}));

vi.mock("@/components/ProductCard", () => ({
  default: () => null,
}));

describe("ProductPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("passes the selected color and size into the cart when adding an item", () => {
    const router = createMemoryRouter(
      [{ path: "/product/:id", element: <ProductPage /> }],
      { initialEntries: ["/product/prod-1"] },
    );

    render(<RouterProvider router={router} />);

    fireEvent.click(screen.getByTitle("Black"));
    fireEvent.click(screen.getByRole("button", { name: "XL" }));
    fireEvent.click(screen.getByRole("button", { name: /add to cart/i }));

    expect(mockAddToCart).toHaveBeenCalledWith(
      mockProducts[0],
      1,
      "Color: Black | Size: XL",
      "Black",
      "XL",
    );
  });
});
