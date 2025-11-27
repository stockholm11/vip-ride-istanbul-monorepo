import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import Hero from "../components/Hero";
import Services from "../components/Services";
import FeaturedTours from "../components/FeaturedTours";
import FeaturedTransfers from "../components/FeaturedTransfers";
import CustomerTestimonials from "../components/CustomerTestimonials";
import CallToAction from "../components/CallToAction";
import { usePublicTours, usePublicVehicles } from "../hooks/public";

export default function HomePage() {
  const { t, i18n } = useTranslation();
  const {
    vehicles,
    loading: loadingVehicles,
    error: vehiclesError,
    refetch: refetchVehicles,
  } = usePublicVehicles();
  const {
    tours,
    loading: loadingTours,
    error: toursError,
    refetch: refetchTours,
  } = usePublicTours();
  const getLocalizedPath = (path: string) => {
    if (path.match(/^\/(en|tr|ar)\//)) return path;
    return `/${i18n.language}${path}`;
  };

  return (
    <>
      <Hero title={t("hero.title")} subtitle={t("hero.subtitle")}>
        <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0 justify-center">
          <Link
            to={getLocalizedPath("/transfer")}
            className="btn-gold px-8 py-4 text-lg font-semibold transition-all duration-300 hover:scale-105"
          >
            {t("hero.cta")}
          </Link>
          <Link
            to={getLocalizedPath("/contact")}
            className="border-2 border-white bg-transparent px-8 py-4 text-lg font-semibold transition-all duration-300 hover:bg-white hover:text-primary"
          >
            {t("hero.secondaryCta")}
          </Link>
        </div>
      </Hero>
      <Services />
      <FeaturedTransfers
        vehicles={vehicles}
        loading={loadingVehicles}
        error={vehiclesError}
        onRetry={refetchVehicles}
      />
      <FeaturedTours
        tours={tours}
        loading={loadingTours}
        error={toursError}
        onRetry={refetchTours}
      />
      <CustomerTestimonials />
      <CallToAction />
    </>
  );
}
