import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from "react-router-dom";
import { Suspense, useEffect, lazy } from "react";
import { I18nextProvider, useTranslation } from "react-i18next";
import i18n from "./utils/i18n";
import MainLayout from "./layouts/MainLayout";
import HomePage from "./pages/HomePage";
import VipToursPage from "./pages/VipToursPage";
import TourDetailPage from "./pages/TourDetailPage";
import TransferPage from "./pages/TransferPage";
import ChauffeurPage from "./pages/ChauffeurPage";
import ContactPage from "./pages/ContactPage";
import NotFoundPage from "./pages/NotFoundPage";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsConditions from "./pages/TermsConditions";
import CancellationPolicy from "./pages/CancellationPolicy";
import PaymentPage from "./pages/PaymentPage";
import PaymentSuccessPage from "./pages/PaymentSuccessPage";
import PaymentFailedPage from "./pages/PaymentFailedPage";
import LoginPage from "./pages/admin/LoginPage";
import ProtectedRoute from "./components/admin/ProtectedRoute";

const AdminLayout = lazy(() => import("./layouts/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminVehicles = lazy(() => import("./pages/admin/Vehicles"));
const AdminTours = lazy(() => import("./pages/admin/Tours"));
const AdminCategories = lazy(() => import("./pages/admin/Categories"));
const AdminReservations = lazy(() => import("./pages/admin/Reservations"));
const AdminAddOns = lazy(() => import("./pages/admin/AddOns"));
const AdminFeaturedTransfers = lazy(() => import("./pages/admin/FeaturedTransfers"));

const LanguagePrefixedRedirect = ({ target }: { target: string }) => {
  const { i18n } = useTranslation();
  const params = useParams();

  const resolvedTarget = target.replace(/:([A-Za-z0-9_]+)/g, (_, key) => {
    const value = params?.[key];
    return value ? encodeURIComponent(value) : "";
  });

  const path = `/${i18n.language}/${resolvedTarget}`.replace(/\/{2,}/g, "/");

  return <Navigate to={path} replace />;
};

function App() {
  const { i18n: i18nInstance } = useTranslation();

  useEffect(() => {
    // Set initial language direction on mount
    document.documentElement.dir = i18nInstance.language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = i18nInstance.language;
  }, [i18nInstance.language]);

  return (
    <I18nextProvider i18n={i18n}>
      <Router>
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-600">Loading...</div>}>
          <Routes>
          {/* Redirect root to default language */}
          <Route path="/" element={<Navigate to={`/${i18nInstance.language}`} replace />} />

          {/* Redirect non-prefixed main routes to language-prefixed versions */}
          <Route path="/transfer" element={<Navigate to={`/${i18nInstance.language}/transfer`} replace />} />
          <Route path="/contact" element={<Navigate to={`/${i18nInstance.language}/contact`} replace />} />
          <Route path="/vip-tours" element={<Navigate to={`/${i18nInstance.language}/vip-tours`} replace />} />
          <Route
            path="/vip-tours/:slug"
            element={<LanguagePrefixedRedirect target="vip-tours/:slug" />}
          />
          <Route path="/chauffeur" element={<Navigate to={`/${i18nInstance.language}/chauffeur`} replace />} />

          {/* Language-specific routes */}
          {['en', 'tr', 'ar'].map((lang) => (
            <Route key={lang} path={`/${lang}`}>
          <Route
                index
            element={
              <MainLayout>
                <HomePage />
              </MainLayout>
            }
          />
          <Route
                path="vip-tours"
            element={
              <MainLayout>
                <VipToursPage />
              </MainLayout>
            }
          />
          <Route
                path="transfer"
            element={
              <MainLayout>
                <TransferPage />
              </MainLayout>
            }
          />
          <Route
                path="chauffeur"
            element={
              <MainLayout>
                <ChauffeurPage />
              </MainLayout>
            }
          />
          <Route
                path="contact"
            element={
              <MainLayout>
                <ContactPage />
              </MainLayout>
            }
          />

          {/* VIP Tours Submenu Routes */}
          <Route
                path="vip-tours/cultural-historical"
            element={
              <MainLayout>
                <VipToursPage categoryFilter="cultural-historical" />
              </MainLayout>
            }
          />
          <Route
                path="vip-tours/shopping-entertainment"
            element={
              <MainLayout>
                <VipToursPage categoryFilter="shopping-entertainment" />
              </MainLayout>
            }
          />
          <Route
                path="vip-tours/nature-excursion"
            element={
              <MainLayout>
                <VipToursPage categoryFilter="nature-excursion" />
              </MainLayout>
            }
          />
          <Route
                path="vip-tours/yacht-boat"
            element={
              <MainLayout>
                <VipToursPage categoryFilter="yacht-boat" />
              </MainLayout>
            }
          />
          <Route
                path="vip-tours/medical"
            element={
              <MainLayout>
                <VipToursPage categoryFilter="medical" />
              </MainLayout>
            }
          />
          <Route
                path="vip-tours/sports"
            element={
              <MainLayout>
                <VipToursPage categoryFilter="sports" />
              </MainLayout>
            }
          />
          <Route
                path="vip-tours/:slug"
            element={
              <MainLayout>
                <TourDetailPage />
              </MainLayout>
            }
          />

              {/* Policy Pages */}
              <Route
                path="privacy-policy"
                element={
                  <MainLayout>
                    <PrivacyPolicy />
                  </MainLayout>
                }
              />
              <Route
                path="terms-conditions"
                element={
                  <MainLayout>
                    <TermsConditions />
                  </MainLayout>
                }
              />
              <Route
                path="cancellation-policy"
                element={
                  <MainLayout>
                    <CancellationPolicy />
                  </MainLayout>
                }
              />

          {/* Transfer Submenu Routes */}
          <Route
                path="transfer/airport"
            element={
              <MainLayout>
                <TransferPage initialTransferType="airport" />
              </MainLayout>
            }
          />
          <Route
                path="transfer/intercity"
            element={
              <MainLayout>
                <TransferPage initialTransferType="intercity" />
              </MainLayout>
            }
          />
          <Route
                path="transfer/city"
            element={
              <MainLayout>
                <TransferPage initialTransferType="city" />
              </MainLayout>
            }
          />

          {/* Payment Routes */}
          <Route
            path="payment/:reservationId"
            element={
              <MainLayout>
                <PaymentPage />
              </MainLayout>
            }
          />
          <Route
            path="payment-success"
            element={
              <MainLayout>
                <PaymentSuccessPage />
              </MainLayout>
            }
          />
          <Route
            path="payment-failed"
            element={
              <MainLayout>
                <PaymentFailedPage />
              </MainLayout>
            }
          />
            </Route>
          ))}

          <Route path="/admin/login" element={<LoginPage />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <AdminDashboard />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/vehicles"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <AdminVehicles />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/tours"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <AdminTours />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/categories"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <AdminCategories />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reservations"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <AdminReservations />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/add-ons"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <AdminAddOns />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/featured-transfers"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <AdminFeaturedTransfers />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          {/* Redirect any non-language-prefixed routes to default language */}
          <Route path="/*" element={<Navigate to={`/${i18nInstance.language}`} replace />} />
        </Routes>
        </Suspense>
      </Router>
    </I18nextProvider>
  );
}

export default App;
