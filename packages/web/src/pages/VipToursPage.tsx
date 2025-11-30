import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import TourCard, { TourType } from "../components/TourCard";
import TourDetailModal from "../components/TourDetailModal";
import BookingForm from "../components/BookingForm";
import Hero from "../components/Hero";
import CategoryFilter from "../components/CategoryFilter";
import { getTours, getCategories } from "../api/public";
import { PublicTour } from "../types/public/PublicTour";
import { PublicCategory } from "../types/public/PublicCategory";
import { mapPublicTourToTourType } from "../utils/public/mapPublicTourToTourType";

// Import hero image
import vipTourImage from "../assets/images/vip_tur.png";

const VipToursPage = ({ categoryFilter = "" }: { categoryFilter?: string }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const [selectedTour, setSelectedTour] = useState<TourType | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [publicTours, setPublicTours] = useState<PublicTour[]>([]);
  const [filteredTours, setFilteredTours] = useState<TourType[]>([]);
  const [categories, setCategories] = useState<PublicCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryFilter);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [tourData, categoryData] = await Promise.all([getTours(), getCategories()]);
      setPublicTours(tourData);
      setCategories(categoryData);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(t("vipTours.loadError", { defaultValue: "Failed to load tours" }));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const mappedTours = publicTours
      .filter((tour) => (selectedCategory ? tour.category.slug === selectedCategory : true))
      .map(mapPublicTourToTourType);
    setFilteredTours(mappedTours);
  }, [publicTours, selectedCategory]);

  // Check for tour query parameter in the URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tourSlug = params.get("tour");
    const categorySlug = params.get("category");

    if (categorySlug && categorySlug !== selectedCategory) {
      setSelectedCategory(categorySlug);
    }

    if (tourSlug) {
      const tour = publicTours.find((tour) => tour.slug === tourSlug);
      if (tour) {
        setSelectedTour(mapPublicTourToTourType(tour));
        setIsDetailModalOpen(true);
      }
    }
  }, [location.search, publicTours, selectedCategory]);

  // Handle opening the detail modal
  const handleViewDetails = (tour: TourType) => {
    setSelectedTour(tour);
    setIsDetailModalOpen(true);
  };

  // Handle booking
  const handleBookNow = (tour: TourType) => {
    setSelectedTour(tour);
    setIsBookingModalOpen(true);
  };

  // Handle category change
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const getCategoryTitle = () => {
    if (!selectedCategory) {
      return t("vipTours.title");
    }
    const category = categories.find((cat) => cat.slug === selectedCategory);
    return category?.name || t("vipTours.title");
  };

  return (
    <>
      <Hero
        title={getCategoryTitle()}
        subtitle={t("vipTours.subtitle")}
        backgroundImage={vipTourImage}
        overlayOpacity={0.6}
      />

      <section className="py-8 md:py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-10 text-center text-gray-500">
              {t("vipTours.loadingTours", { defaultValue: "Loading tours..." })}
            </div>
          ) : error ? (
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-10 text-center text-red-500 space-y-4">
              <p>{error}</p>
              <button
                type="button"
                onClick={fetchData}
                className="px-4 py-2 rounded-lg border border-red-300 text-red-600 hover:bg-red-50"
              >
                {t("transfer.retry", { defaultValue: "Retry" })}
              </button>
            </div>
          ) : (
            <>
              <CategoryFilter
                currentCategory={selectedCategory}
                onCategoryChange={handleCategoryChange}
                categories={categories
                  .slice()
                  .sort((a, b) => a.name.localeCompare(b.name, 'tr', { sensitivity: 'base' }))
                  .map((category) => ({
                    id: category.slug,
                    label: category.name,
                  }))}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {filteredTours.length > 0 ? (
                  filteredTours.map((tour) => (
                    <motion.div
                      key={tour.slug}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <TourCard
                        tour={tour}
                        onViewDetails={handleViewDetails}
                        onBookNow={handleBookNow}
                      />
                    </motion.div>
                  ))
                ) : (
                  <div className="col-span-full py-16 text-center">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      {t("vipTours.noTours")}
                    </h3>
                    <p className="text-gray-600">
                      {t("vipTours.noToursDescription", {
                        defaultValue: "Please adjust your filters to see available tours.",
                      })}
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Tour Detail Modal */}
      {selectedTour && (
        <TourDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          tour={selectedTour}
          onBookNow={() => {
            setIsDetailModalOpen(false);
            setIsBookingModalOpen(true);
          }}
        />
      )}

      {/* Booking Form Modal */}
      <BookingForm
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        tour={selectedTour}
      />
    </>
  );
};

export default VipToursPage;
