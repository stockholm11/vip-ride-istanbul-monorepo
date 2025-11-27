import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import TourDetailModal from "./TourDetailModal";
import BookingForm from "./BookingForm";
import { TourType } from "./TourCard";
import { PublicTour } from "../types/public/PublicTour";
import { mapPublicTourToTourType } from "../utils/public/mapPublicTourToTourType";

interface FeaturedToursProps {
  tours: PublicTour[];
  loading: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export default function FeaturedTours({
  tours,
  loading,
  error,
  onRetry,
}: FeaturedToursProps) {
  const { t, i18n } = useTranslation();
  const [selectedTour, setSelectedTour] = useState<TourType | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  const sliderRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const toursPerPage = 3;
  const totalToursToShow = 6;

  const filteredTours = useMemo(() => {
    if (!tours.length) return [];

    // Backend already filters by is_active = 1, so we only sort and limit here
    return tours
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .slice(0, totalToursToShow);
  }, [tours]);

  const totalPages = Math.max(1, Math.ceil(filteredTours.length / toursPerPage));


  useEffect(() => {
    const startAutoPlay = () => {
      // Clear existing interval if any
      if (autoPlayRef.current) clearTimeout(autoPlayRef.current);

      // Set new interval
      autoPlayRef.current = setTimeout(() => {
        setCurrentPage(prev => (prev + 1) % totalPages);
      }, 5000); // Auto-rotate every 5 seconds
    };

    startAutoPlay();

    // Pause auto-rotation when mouse is over the slider
    const handleMouseEnter = () => {
      if (autoPlayRef.current) clearTimeout(autoPlayRef.current);
    };

    const handleMouseLeave = () => {
      startAutoPlay();
    };

    // Add event listeners to slider
    const sliderElement = sliderRef.current;
    if (sliderElement) {
      sliderElement.addEventListener('mouseenter', handleMouseEnter);
      sliderElement.addEventListener('mouseleave', handleMouseLeave);
    }

    // Cleanup
    return () => {
      if (autoPlayRef.current) clearTimeout(autoPlayRef.current);
      if (sliderElement) {
        sliderElement.removeEventListener('mouseenter', handleMouseEnter);
        sliderElement.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [currentPage, totalPages]);

  const goToNextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const goToPrevPage = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const goToPage = (pageIndex: number) => {
    setCurrentPage(pageIndex);
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat(
      i18n.language === "tr" ? "tr-TR" : i18n.language === "ar" ? "ar-SA" : "en-US",
      {
        style: "currency",
        currency: "EUR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }
    ).format(price);

  const getLocalizedPath = (path: string) => {
    if (path.match(/^\/(en|tr|ar)\//)) return path;
    return `/${i18n.language}${path}`;
  };

  const handleViewDetails = (tour: PublicTour) => {
    const mapped = mapPublicTourToTourType(tour);
    setSelectedTour(mapped);
    setIsDetailModalOpen(true);
  };

  const handleBookNow = (tour: TourType) => {
    setSelectedTour(tour);
    setIsBookingModalOpen(true);
  };

  const renderSliderContent = () => {
    if (loading) {
      return (
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-10 text-center text-gray-500">
          {t("vipTours.loadingTours", { defaultValue: "Loading tours..." })}
        </div>
      );
    }

    if (error) {
      return (
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-10 text-center text-red-500 space-y-4">
          <p>{error}</p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="px-4 py-2 rounded-lg border border-red-300 text-red-600 hover:bg-red-50"
            >
              {t("transfer.retry", { defaultValue: "Retry" })}
            </button>
          )}
        </div>
      );
    }

    if (!filteredTours.length) {
      return (
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-10 text-center text-gray-500">
          {t("vipTours.noTours", {
            defaultValue: "No tours available right now.",
          })}
        </div>
      );
    }

    return (
      <div className="relative" ref={sliderRef}>
        {totalPages > 1 && (
          <>
            <button
              onClick={goToPrevPage}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
              aria-label="Previous"
            >
              <ChevronLeftIcon className="h-5 w-5 text-primary" />
            </button>

            <button
              onClick={goToNextPage}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
              aria-label="Next"
            >
              <ChevronRightIcon className="h-5 w-5 text-primary" />
            </button>
          </>
        )}

        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentPage * 100}%)` }}
          >
            {Array.from({ length: totalPages }).map((_, pageIndex) => (
              <div key={pageIndex} className="w-full flex-shrink-0">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {filteredTours
                    .slice(pageIndex * toursPerPage, pageIndex * toursPerPage + toursPerPage)
                    .map((tour) => (
                      <motion.div
                        key={tour.slug}
                        className="flex h-full flex-col overflow-hidden rounded-lg bg-white shadow-lg"
                      >
                        <div className="relative h-64">
                          <img
                            src={tour.imageUrl}
                            alt={tour.title}
                            className="h-full w-full object-cover"
                          />
                          <div className="absolute top-2 right-2 rounded bg-primary px-3 py-1 text-sm font-semibold text-white">
                            {formatPrice(tour.price)}
                          </div>
                        </div>
                        <div className="flex flex-grow flex-col p-6">
                          <h3 className="mb-2 text-xl font-semibold text-primary">{tour.title}</h3>
                          <p className="mb-4 flex-grow text-gray-600 line-clamp-3">
                            {tour.shortDescription || tour.longDescription}
                          </p>
                          <div className="mt-auto flex items-center justify-between">
                            <span className="text-sm text-gray-500">
                              {tour.durationMinutes !== null && tour.durationMinutes !== undefined
                                ? `${Math.max(1, Math.min(12, Math.round(tour.durationMinutes / 60)))} ${t("vipTours.hours")}`
                                : "—"}
                            </span>
                            <button
                              onClick={() => handleViewDetails(tour)}
                              className="rounded bg-secondary px-4 py-2 text-sm font-semibold text-white hover:bg-secondary-dark transition-colors"
                            >
                              {t("featuredTours.viewDetails")}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {totalPages > 1 && (
          <div className="mt-8 flex justify-center space-x-2">
            {Array.from({ length: totalPages }).map((_, index) => (
              <button
                key={index}
                onClick={() => goToPage(index)}
                className={`h-3 w-3 rounded-full ${
                  currentPage === index ? "bg-primary" : "bg-gray-300"
                } hover:bg-primary-light transition-colors`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <section className="bg-white py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="mb-4 text-4xl font-bold text-primary">{t("featuredTours.title")}</h2>
          <p className="text-lg text-gray-600">{t("featuredTours.subtitle")}</p>
        </div>

        {renderSliderContent()}

        <div className="mt-12 text-center">
          <Link
            to={getLocalizedPath("/vip-tours")}
            className="inline-flex items-center rounded-md border border-secondary px-6 py-3 font-medium text-secondary transition-colors hover:bg-secondary hover:text-white"
          >
            {t("featuredTours.viewAll")}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="ml-2 h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
        </div>
      </div>

      {selectedTour && (
        <TourDetailModal
          tour={selectedTour}
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          onBookNow={(tourDetail) => {
            setIsDetailModalOpen(false);
            handleBookNow(tourDetail);
          }}
        />
      )}

      <BookingForm
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        tour={selectedTour}
      />
    </section>
  );
}
