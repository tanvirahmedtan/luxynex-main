import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import React, { Suspense, lazy } from "react";
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
const Shop = lazy(() => import("./pages/Shop"));
const ProductPage = lazy(() => import("./pages/ProductPage"));
const CartPage = lazy(() => import("./pages/CartPage"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const CheckoutPayment = lazy(() => import("./pages/CheckoutPayment"));
const TrackOrder = lazy(() => import("./pages/TrackOrder"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const WishlistPage = lazy(() => import("./pages/WishlistPage"));
const SignIn = lazy(() => import("./pages/SignIn"));
const SignUp = lazy(() => import("./pages/SignUp"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const SupportTickets = lazy(() => import("./pages/SupportTickets"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const ReturnAndRefund = lazy(() => import("./pages/ReturnAndRefund"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Admin lazy-loaded
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));
const AdminCustomers = lazy(() => import("./pages/admin/AdminCustomers"));
const AdminBanners = lazy(() => import("./pages/admin/AdminBanners"));
const AdminPopups = lazy(() => import("./pages/admin/AdminPopups"));
const AdminCategories = lazy(() => import("./pages/admin/AdminCategories"));
const AdminCreateOrder = lazy(() => import("./pages/admin/AdminCreateOrder"));
const AdminScanOrder = lazy(() => import("./pages/admin/AdminScanOrder"));
const AdminOrderReport = lazy(() => import("./pages/admin/AdminOrderReport"));
const AdminBarcodes = lazy(() => import("./pages/admin/AdminBarcodes"));
const AdminStocks = lazy(() => import("./pages/admin/AdminStocks"));
const AdminPurchases = lazy(() => import("./pages/admin/AdminPurchases"));
const AdminAddPurchase = lazy(() => import("./pages/admin/AdminAddPurchase"));
const AdminWarehouse = lazy(() => import("./pages/admin/AdminWarehouse"));
const AdminSubcategories = lazy(() => import("./pages/admin/AdminSubcategories"));
const AdminNewCustomer = lazy(() => import("./pages/admin/AdminNewCustomer"));
const AdminCreateProduct = lazy(() => import("./pages/admin/AdminCreateProduct"));
const AdminSupportTickets = lazy(() => import("./pages/admin/AdminSupportTickets"));
const AdminCouponsList = lazy(() => import("./pages/admin/AdminCoupons").then(m => ({ default: m.AdminCouponsList })));
const AdminCouponForm = lazy(() => import("./pages/admin/AdminCoupons").then(m => ({ default: m.AdminCouponForm })));

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
              <Suspense fallback={<div className="min-h-[60vh]" />}>
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
                <Route path="/support-tickets" element={<Layout><RequireAuth><SupportTickets /></RequireAuth></Layout>} />
                <Route path="/privacy-policy" element={<Layout><PrivacyPolicy /></Layout>} />
                <Route path="/terms-of-service" element={<Layout><TermsOfService /></Layout>} />
                <Route path="/return-and-refund" element={<Layout><ReturnAndRefund /></Layout>} />
                {/* Admin Routes without Layout */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/products" element={<AdminProducts />} />
                <Route path="/admin/orders" element={<AdminOrders />} />
                <Route path="/admin/customers" element={<AdminCustomers />} />
                <Route path="/admin/support-tickets" element={<AdminSupportTickets />} />
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
              </Suspense>
            </BrowserRouter>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
