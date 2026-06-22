import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/contexts/CartContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { AuthProvider } from "@/contexts/AuthContext";
import RequireAuth from "@/components/RequireAuth";
import Layout from "@/components/layout/Layout";
import PWAInstallBanner from "@/components/PWAInstallBanner";
import Index from "./pages/Index";
import Shop from "./pages/Shop";
import ProductPage from "./pages/ProductPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import TrackOrder from "./pages/TrackOrder";
import About from "./pages/About";
import Contact from "./pages/Contact";
import WishlistPage from "./pages/WishlistPage";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import ProfilePage from "./pages/ProfilePage";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import ReturnAndRefund from "./pages/ReturnAndRefund";
import CheckoutPayment from "./pages/CheckoutPayment";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminCustomers from "./pages/admin/AdminCustomers";
import AdminBanners from "./pages/admin/AdminBanners";
import AdminPopups from "./pages/admin/AdminPopups";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminCreateOrder from "./pages/admin/AdminCreateOrder";
import AdminScanOrder from "./pages/admin/AdminScanOrder";
import AdminOrderReport from "./pages/admin/AdminOrderReport";
import AdminBarcodes from "./pages/admin/AdminBarcodes";
import AdminStocks from "./pages/admin/AdminStocks";
import AdminPurchases from "./pages/admin/AdminPurchases";
import AdminAddPurchase from "./pages/admin/AdminAddPurchase";
import AdminWarehouse from "./pages/admin/AdminWarehouse";
import AdminSubcategories from "./pages/admin/AdminSubcategories";
import AdminNewCustomer from "./pages/admin/AdminNewCustomer";
import AdminCreateProduct from "./pages/admin/AdminCreateProduct";
import { AdminCouponsList, AdminCouponForm } from "./pages/admin/AdminCoupons";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <Toaster />
            <Sonner />
            <PWAInstallBanner />
            <BrowserRouter>
              <Routes>
                {/* Public Routes with Layout */}
                <Route path="/" element={<Layout><Index /></Layout>} />
                <Route path="/shop" element={<Layout><Shop /></Layout>} />
                <Route path="/product/:id" element={<Layout><ProductPage /></Layout>} />
                <Route path="/cart" element={<Layout><CartPage /></Layout>} />
                <Route
                  path="/checkout"
                  element={
                    <Layout>
                      <RequireAuth>
                        <CheckoutPage />
                      </RequireAuth>
                    </Layout>
                  }
                />
                <Route
                  path="/checkout/payment/:orderId?"
                  element={
                    <Layout>
                      <RequireAuth>
                        <CheckoutPayment />
                      </RequireAuth>
                    </Layout>
                  }
                />
                <Route path="/track" element={<Layout><TrackOrder /></Layout>} />
                <Route path="/track-order" element={<Layout><TrackOrder /></Layout>} />
                <Route path="/order-success" element={<Layout><TrackOrder /></Layout>} />
                <Route path="/about" element={<Layout><About /></Layout>} />
                <Route path="/about-us" element={<Layout><About /></Layout>} />
                <Route path="/contact" element={<Layout><Contact /></Layout>} />
                <Route path="/wishlist" element={<Layout><WishlistPage /></Layout>} />
                <Route path="/signin" element={<Layout><SignIn /></Layout>} />
                <Route path="/signup" element={<Layout><SignUp /></Layout>} />
                <Route path="/profile" element={<Layout><ProfilePage /></Layout>} />
                <Route path="/privacy-policy" element={<Layout><PrivacyPolicy /></Layout>} />
                <Route path="/terms-of-service" element={<Layout><TermsOfService /></Layout>} />
                <Route path="/return-and-refund" element={<Layout><ReturnAndRefund /></Layout>} />
                {/* Admin Routes without Layout */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/products" element={<AdminProducts />} />
                <Route path="/admin/orders" element={<AdminOrders />} />
                <Route path="/admin/customers" element={<AdminCustomers />} />
                <Route path="/admin/banners" element={<AdminBanners />} />
                <Route path="/admin/popups" element={<AdminPopups />} />
                <Route path="/admin/categories" element={<AdminCategories />} />
                <Route path="/admin/warehouse" element={<AdminWarehouse />} />
                <Route
                  path="/admin/orders/create"
                  element={<AdminCreateOrder />}
                />
                <Route path="/admin/orders/scan" element={<AdminScanOrder />} />
                <Route
                  path="/admin/orders/report"
                  element={<AdminOrderReport />}
                />
                <Route
                  path="/admin/products/create"
                  element={<AdminCreateProduct />}
                />
                <Route
                  path="/admin/products/edit/:id"
                  element={<AdminCreateProduct />}
                />
                <Route
                  path="/admin/products/barcodes"
                  element={<AdminBarcodes />}
                />
                <Route path="/admin/stocks" element={<AdminStocks />} />
                <Route path="/admin/purchases" element={<AdminPurchases />} />
                <Route
                  path="/admin/purchases/add"
                  element={<AdminAddPurchase />}
                />
                <Route
                  path="/admin/subcategories"
                  element={<AdminSubcategories />}
                />
                <Route
                  path="/admin/categories/create"
                  element={<AdminCategories />}
                />
                <Route
                  path="/admin/subcategories/create"
                  element={<AdminCategories />}
                />
                <Route
                  path="/admin/customers/new"
                  element={<AdminNewCustomer />}
                />
                <Route path="/admin/coupons" element={<AdminCouponsList />} />
                <Route
                  path="/admin/coupons/create"
                  element={<AdminCouponForm />}
                />
                <Route
                  path="/admin/coupons/edit/:id"
                  element={<AdminCouponForm />}
                />
                <Route path="*" element={<Layout><NotFound /></Layout>} />
              </Routes>
            </BrowserRouter>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
