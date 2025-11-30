import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPinIcon,
  ArrowRightIcon,
  ClockIcon,
  CurrencyEuroIcon,
  CheckIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { Dialog, Disclosure, Transition } from "@headlessui/react";
import { ChevronUpIcon } from "@heroicons/react/20/solid";
import { useIsMobile } from "../hooks/useMediaQuery";
import { useFeaturedTransfers } from "../hooks/public";
import { PublicVehicle, VehicleWithPrice } from "../types/public/PublicVehicle";
import { PublicFeaturedTransfer } from "../types/public/FeaturedTransfer";
import { TransferType } from "../types/transfer";
import { TransferFormData } from "./TransferBookingForm";
import QuickBookingWidget from "./QuickBookingWidget";
import TransferBookingConfirmation from "./TransferBookingConfirmation";
import defaultVehicleImage from "../assets/images/vehicles/mercedes-vito-tourer.jpg";

// Define types
interface FeaturedRoute {
  id: string;
  fromLocation: string;
  fromLocationId: string;
  toLocation: string;
  toLocationId: string;
  estimatedTime: string;
  transferType: TransferType;
  basePrice: number;
  image: string;
  vehicle: PublicVehicle | null;
  fallbackVehicleName: string;
  passengerCapacity: number | null;
  luggageCapacity: number | null;
}

interface FeaturedTransfersProps {
  vehicles: PublicVehicle[];
  loading: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export default function FeaturedTransfers({
  vehicles,
  loading,
  error,
  onRetry,
}: FeaturedTransfersProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const {
    data: featuredTransfers,
    loading: featuredLoading,
    error: featuredError,
    refetch: refetchFeatured,
  } = useFeaturedTransfers();
  const [quickBookingData, setQuickBookingData] = useState<{
    isOpen: boolean;
    fromLocationId: string;
    toLocationId: string;
    transferType: 'airport' | 'city' | 'intercity';
    selectedRoute?: FeaturedRoute;
  } | null>(null);
  const [featuredPricing, setFeaturedPricing] = useState<{ basePrice: number; featuredTransferId: string } | null>(null);

  // New state for direct booking confirmation
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleWithPrice | null>(null);
  const [transferData, setTransferData] = useState<{
    transferType: TransferType;
    fromLocation: string;
    toLocation: string;
    date: string;
    time: string;
    passengers: number;
    luggage: number;
    roundTrip: boolean;
    returnDate?: string;
    returnTime?: string;
  } | null>(null);
  const [locations, setLocations] = useState<{
    fromName: string;
    toName: string;
    fromId?: string;
    toId?: string;
    distance?: number;
    travelTime?: string;
  } | null>(null);
  const combinedLoading = loading || featuredLoading;
  const combinedError = error || featuredError;

  // Lock body scroll when modal is open
  useEffect(() => {
    if (quickBookingData?.isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [quickBookingData?.isOpen]);

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    }
    refetchFeatured();
  };

  // Slider states
  const [currentPage, setCurrentPage] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef<ReturnType<typeof setTimeout> | null>(null); // Updated timer reference type

  const [resolvedRoutes, setResolvedRoutes] = useState<FeaturedRoute[]>([]);

  const slugifyLocation = (value: string) => {
    const normalized = value
      .toLowerCase()
      .replace(/ç/g, "c")
      .replace(/ğ/g, "g")
      .replace(/ı/g, "i")
      .replace(/ö/g, "o")
      .replace(/ş/g, "s")
      .replace(/ü/g, "u")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    return normalized || value.toLowerCase();
  };

  const inferTransferType = (from: string, to: string): TransferType => {
    const airportRegex = /(airport|havaalan|havaliman|ist|saw|sabiha|istanbul airport)/i;
    if (airportRegex.test(from) || airportRegex.test(to)) {
      return "airport";
    }

    const intercityKeywords = /(ankara|izmir|antalya|bursa|bodrum|edirne|eskisehir|yalova|tekirdag)/i;
    if (intercityKeywords.test(from) || intercityKeywords.test(to)) {
      return "intercity";
    }

    return "city";
  };

  useEffect(() => {
    const mapped = (featuredTransfers ?? []).map((item: PublicFeaturedTransfer) => {
      const matchedVehicle =
        vehicles.find((vehicle) => vehicle.slug === item.vehicleSlug) ||
        vehicles.find((vehicle) => vehicle.id.toString() === item.vehicleId);

      // Use vehicle's mainImage directly since it's already properly formatted
      // The vehicle image comes from the database and is correctly processed by PublicVehicleController
      const imageSource = matchedVehicle?.mainImage || defaultVehicleImage;

      const fromLocationId = slugifyLocation(item.fromLocation);
      const toLocationId = slugifyLocation(item.toLocation);
      const transferType = inferTransferType(item.fromLocation, item.toLocation);

      return {
        id: item.id,
        fromLocation: item.fromLocation,
        fromLocationId,
        toLocation: item.toLocation,
        toLocationId,
        estimatedTime: item.estimatedTime,
        transferType,
        basePrice: item.basePrice,
        image: imageSource,
        vehicle: matchedVehicle ?? null,
        fallbackVehicleName: item.vehicleName ?? matchedVehicle?.name ?? "VIP Vehicle",
        passengerCapacity: item.passengerCapacity ?? matchedVehicle?.passengerCapacity ?? null,
        luggageCapacity: item.luggageCapacity ?? matchedVehicle?.luggageCapacity ?? null,
      } as FeaturedRoute;
    });

    setResolvedRoutes(mapped);
  }, [featuredTransfers, vehicles]);

  // Number of routes to display per page
  const routesPerPage = 3;
  // Total routes we want to show (9 total)
  const totalRoutesToShow = 9;

  // Get routes to display (all routes, limited to 9)
  const filteredRoutes = resolvedRoutes.slice(0, totalRoutesToShow);

  // Calculate total number of pages
  const totalPages = Math.ceil(filteredRoutes.length / routesPerPage);

  // Get current visible routes
  const currentRoutes = filteredRoutes.slice(
    currentPage * routesPerPage,
    currentPage * routesPerPage + routesPerPage
  );

  // Handle auto-rotation
  useEffect(() => {
    if (totalPages <= 1) {
      if (autoPlayRef.current) {
        clearTimeout(autoPlayRef.current);
      }
      return;
    }

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

  // Navigation functions
  const goToNextPage = () => {
    setCurrentPage(prev => (prev + 1) % totalPages);
  };

  const goToPrevPage = () => {
    setCurrentPage(prev => (prev - 1 + totalPages) % totalPages);
  };

  const goToPage = (pageIndex: number) => {
    setCurrentPage(pageIndex);
  };

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(i18n.language === 'tr' ? 'tr-TR' : i18n.language === 'ar' ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Helper function to add language prefix
  const getLocalizedPath = (path: string) => {
    if (path.match(/^\/(en|tr|ar)\//)) return path;
    return `/${i18n.language}${path}`;
  };

  // Generate pre-populated transfer link
  // Handle quick booking submission
  const handleQuickBooking = async (
    fromLocationId: string,
    toLocationId: string,
    transferType: 'airport' | 'city' | 'intercity',
    date: string,
    time: string,
    passengers: number,
    luggage: number,
    roundTrip: boolean,
    returnDate?: string,
    returnTime?: string
  ) => {
    if (quickBookingData?.selectedRoute) {
      const selectedRoute = quickBookingData.selectedRoute;
      const routeVehicle = selectedRoute.vehicle;
      if (!routeVehicle) {
        alert(t("transfer.vehicleUnavailable", { defaultValue: "Seçilen araç bulunamadı. Lütfen daha sonra tekrar deneyin." }));
        return;
      }

      const basePrice = selectedRoute.basePrice * (roundTrip ? 2 : 1);
      const vehicleWithPrice: VehicleWithPrice = {
        ...routeVehicle,
        price: basePrice,
      };

      setSelectedVehicle(vehicleWithPrice);
      setTransferData({
        transferType,
        fromLocation: selectedRoute.fromLocation,
        toLocation: selectedRoute.toLocation,
        date,
        time,
        passengers,
        luggage,
        roundTrip,
        returnDate,
        returnTime,
      });
      setLocations({
        fromName: selectedRoute.fromLocation,
        toName: selectedRoute.toLocation,
        fromId: selectedRoute.fromLocationId,
        toId: selectedRoute.toLocationId,
        travelTime: selectedRoute.estimatedTime,
      });
      setFeaturedPricing({ basePrice, featuredTransferId: selectedRoute.id });
      setQuickBookingData(null);
      setShowConfirmation(true);
      return;
    }

    setFeaturedPricing(null);
    const params = new URLSearchParams();
    params.append("from", fromLocationId);
    params.append("to", toLocationId);
    params.append("type", transferType);
    params.append("date", date);
    params.append("time", time);
    params.append("passengers", passengers.toString());
    params.append("luggage", luggage.toString());
    params.append("booking", "true");

    if (roundTrip && returnDate && returnTime) {
      params.append("roundTrip", "true");
      params.append("returnDate", returnDate);
      params.append("returnTime", returnTime);
    }

    window.location.href = getLocalizedPath(`/transfer?${params.toString()}`);
  };

  // Helper function to get location name
  const getLocationName = (id: string, transferType: TransferType): string => {
    // Define a basic location map (you can expand this with more locations)
    const locationMap: Record<string, Record<string, string>> = {
      airports: {
        ist: "Istanbul Airport (IST)",
        saw: "Sabiha Gökçen Airport (SAW)"
      },
      districts: {
        adalar: "Adalar",
        atasehir: "Ataşehir",
        besiktas: "Beşiktaş",
        beyoglu: "Beyoğlu",
        kadikoy: "Kadıköy",
        sisli: "Şişli",
        taksim: "Taksim",
        sultanahmet: "Sultanahmet",
        nisantasi: "Nişantaşı",
        florya: "Florya"
      },
      cities: {
        istanbul: "Istanbul",
        ankara: "Ankara",
        bursa: "Bursa"
      }
    };

    switch (transferType) {
      case 'airport':
        return id in locationMap.airports
          ? locationMap.airports[id]
          : id in locationMap.districts
            ? locationMap.districts[id]
            : id;
      case 'city':
        return id in locationMap.districts ? locationMap.districts[id] : id;
      case 'intercity':
        return id in locationMap.cities ? locationMap.cities[id] : id;
      default:
        return id;
    }
  };

  // Handle closing confirmation modal
  const handleCloseConfirmation = () => {
    setShowConfirmation(false);
    setSelectedVehicle(null);
    setTransferData(null);
    setLocations(null);
    setFeaturedPricing(null);
  };

  // Helper function to get card color based on vehicle type
  const getCardColorClass = (route: FeaturedRoute) => {
    const slug = route.vehicle?.slug?.toLowerCase() || "";
    if (slug.includes("sprinter") && slug.includes("vip")) {
      return "border-amber-500";
    }
    if (slug.includes("sprinter")) {
      return "border-green-500";
    }
    return "border-blue-500";
  };

  return (
    <section className="bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl font-bold text-primary mb-4">{t('featured.popularTransfers')}</h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            {t('featured.popularTransfersDesc')}
          </p>
        </motion.div>

        {/* Slider container */}
        {combinedLoading && (
          <div className="border-2 border-dashed border-gray-200 rounded-lg p-10 text-center text-gray-500">
            {t('featured.loadingRoutes', { defaultValue: "Loading featured transfers..." })}
          </div>
        )}

        {!combinedLoading && combinedError && (
          <div className="border-2 border-dashed border-gray-200 rounded-lg p-10 text-center text-red-500 space-y-4">
            <p>{combinedError}</p>
            <button
              type="button"
              onClick={handleRetry}
              className="px-4 py-2 rounded-lg border border-red-300 text-red-600 hover:bg-red-50"
            >
              {t("transfer.retry", { defaultValue: "Retry" })}
            </button>
          </div>
        )}

        {!combinedLoading && !combinedError && filteredRoutes.length === 0 && (
          <div className="border-2 border-dashed border-gray-200 rounded-lg p-10 text-center text-gray-500">
            {t('featured.noRoutes', { defaultValue: "No featured routes available right now." })}
          </div>
        )}

        {!combinedLoading && !combinedError && filteredRoutes.length > 0 && (
          <div className="relative" ref={sliderRef}>
            {/* Navigation buttons */}
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

            {/* Slider content */}
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentPage * 100}%)` }}
              >
                {Array.from({ length: totalPages }).map((_, pageIndex) => (
                  <div key={pageIndex} className="w-full flex-shrink-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {filteredRoutes
                        .slice(
                          pageIndex * routesPerPage,
                          pageIndex * routesPerPage + routesPerPage
                        )
                        .map((route, index) => {
                          const cardColorClass = getCardColorClass(route);

                          return (
                            <motion.div
                              key={route.id}
                              initial={{ opacity: 0, y: 20 }}
                              whileInView={{ opacity: 1, y: 0 }}
                              viewport={{ once: true }}
                              transition={{ duration: 0.5, delay: index * 0.1 }}
                              className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow border-t-4 ${cardColorClass}`}
                            >
                              {/* Route image */}
                              <div className="relative h-64 overflow-hidden">
                                <img
                                  src={route.image}
                                  alt={`${route.fromLocation} to ${route.toLocation}`}
                                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                                />
                                <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/60 to-transparent text-white p-4">
                                  <span className="text-sm font-medium">
                                    {route.transferType === 'airport'
                                      ? t('transfer.airport')
                                      : route.transferType === 'intercity'
                                      ? t('transfer.intercity')
                                      : t('transfer.cityTransfer')}
                                  </span>
                                </div>
                              </div>

                              {/* Route info */}
                              <div className="p-5">
                                <div className="flex items-center mb-4">
                                  <MapPinIcon className="h-5 w-5 text-primary flex-shrink-0" />
                                  <div className="ml-2 flex-1 flex items-center">
                                    <span className="text-gray-700 truncate">{route.fromLocation}</span>
                                    <ArrowRightIcon className="h-4 w-4 mx-2 text-secondary flex-shrink-0" />
                                    <span className="text-gray-700 truncate">{route.toLocation}</span>
                                  </div>
                                </div>

                                {/* Vehicle Name */}
                                <div className="mb-3 text-sm font-medium text-primary">
                                  <span>{route.vehicle?.name ?? route.fallbackVehicleName}</span>
                                </div>

                                <div className="grid grid-cols-3 gap-3 mb-5">
                                  <div className="flex flex-col items-center bg-gray-50 rounded-lg p-2">
                                    <ClockIcon className="h-4 w-4 text-secondary mb-1" />
                                    <span className="text-xs text-gray-500">Tahmini Süre</span>
                                    <span className="text-sm font-medium">{route.estimatedTime}</span>
                                  </div>
                                <div className="flex flex-col items-center bg-gray-50 rounded-lg p-2">
                                  <UsersIcon className="h-4 w-4 text-secondary mb-1" />
                                  <span className="text-xs text-gray-500">{t('transfer.passengers')}</span>
                                  <span className="text-sm font-medium">
                                    {route.passengerCapacity ?? "—"}
                                  </span>
                                </div>
                                  <div className="flex flex-col items-center bg-gray-50 rounded-lg p-2">
                                    <CurrencyEuroIcon className="h-4 w-4 text-secondary mb-1" />
                                    <span className="text-xs text-gray-500">{t('transfer.price')}</span>
                                    <span className="text-sm font-medium">{formatPrice(route.basePrice)}</span>
                                  </div>
                                </div>

                                <div className="flex space-x-2">
                                  <button
                                    onClick={() =>
                                      setQuickBookingData({
                                        isOpen: true,
                                        fromLocationId: route.fromLocationId,
                                        toLocationId: route.toLocationId,
                                        transferType: route.transferType,
                                        selectedRoute: route,
                                      })
                                    }
                                    className="w-full py-2 bg-secondary text-white text-center font-medium rounded-md hover:bg-secondary-dark transition-colors"
                                  >
                                    {t('featured.quickBook')}
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pagination dots */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8 space-x-2">
                {Array.from({ length: totalPages }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToPage(index)}
                    className={`w-3 h-3 rounded-full ${
                      currentPage === index ? 'bg-primary' : 'bg-gray-300'
                    } hover:bg-primary-light transition-colors`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Booking Widget Modal */}
      <AnimatePresence>
        {quickBookingData && quickBookingData.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setQuickBookingData(null);
              }
            }}
          >
            <div className={`relative w-full ${isMobile ? 'max-w-full' : 'max-w-md'}`}>
              {isMobile && (
                <button
                  onClick={() => setQuickBookingData(null)}
                  className="absolute right-4 top-4 z-10 bg-white rounded-full p-2 shadow-md min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label="Close"
                >
                  <XMarkIcon className="h-6 w-6 text-gray-600" />
                </button>
              )}
              <QuickBookingWidget
                fromLocationId={quickBookingData.fromLocationId}
                toLocationId={quickBookingData.toLocationId}
                transferType={quickBookingData.transferType}
                onClose={() => setQuickBookingData(null)}
                onSubmit={handleQuickBooking}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transfer Booking Confirmation Modal */}
      <TransferBookingConfirmation
        isOpen={showConfirmation}
        onClose={handleCloseConfirmation}
        vehicle={selectedVehicle}
        transferData={transferData}
        locations={locations}
        featuredPricing={featuredPricing}
      />
    </section>
  );
}
