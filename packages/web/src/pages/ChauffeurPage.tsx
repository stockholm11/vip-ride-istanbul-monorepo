import { useTranslation } from "react-i18next";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ClockIcon, UserIcon, StarIcon, CurrencyDollarIcon, TruckIcon } from "@heroicons/react/24/outline";
import ChauffeurBookingForm, { ChauffeurBookingData } from "../components/ChauffeurBookingForm";
import Hero from "../components/Hero";
import { usePublicVehicles } from "../hooks/public/usePublicVehicles";
import { PublicVehicle } from "../types/public/PublicVehicle";

// Import hero image
import heroImage from "../assets/images/mercedes-vito-black.jpg";

export default function ChauffeurPage() {
  const { t } = useTranslation();
  const { vehicles, loading: loadingVehicles, error: vehiclesError, refetch: refetchVehicles } =
    usePublicVehicles();
  const chauffeurVehicles = useMemo(
    () => vehicles.filter((vehicle) => vehicle.types && vehicle.types.includes("chauffeur")),
    [vehicles]
  );
  const [filteredVehicles, setFilteredVehicles] = useState<PublicVehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<PublicVehicle | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingSubmitted, setBookingSubmitted] = useState(false);
  const [bookingReference, setBookingReference] = useState('');

  useEffect(() => {
    setFilteredVehicles(chauffeurVehicles);
  }, [chauffeurVehicles]);

  const handleSelectVehicle = (vehicle: PublicVehicle) => {
    setSelectedVehicle(vehicle);
    setShowBookingForm(true);
    // Scroll to top to show the form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBookingSubmit = (formData: ChauffeurBookingData) => {
    // In a real implementation, this would send data to a backend API
    console.log("Booking form submitted:", formData);

    // Generate a random booking reference
    const reference = `CHF-${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`;
    setBookingReference(reference);

    // Show success message
    setBookingSubmitted(true);

    // Close the form
    setTimeout(() => {
      setShowBookingForm(false);
      setSelectedVehicle(null);
    }, 5000);
  };

  const handleBookingCancel = () => {
    setShowBookingForm(false);
    setSelectedVehicle(null);
  };

  // Get hourly rate for chauffeur service (basePrice from vehicle)
  // Note: For chauffeur service, basePrice IS the hourly rate
  const getHourlyRate = (vehicle: PublicVehicle): number => {
    return vehicle.basePrice;
  };

  return (
    <>
      <Hero
        title={t("chauffeur.title")}
        subtitle={t("chauffeur.subtitle")}
        backgroundImage={heroImage}
        overlayOpacity={0.6}
      />

      <div className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-primary mb-4">
              {t("chauffeur.title")}
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-4">
              {t("chauffeur.subtitle")}
            </p>
          </div>

          {/* Booking Form Modal */}
          <AnimatePresence>
            {showBookingForm && selectedVehicle && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto"
              >
                <div className="w-full max-w-4xl">
                  <ChauffeurBookingForm
                    vehicle={selectedVehicle}
                    onSubmit={handleBookingSubmit}
                    onCancel={handleBookingCancel}
                    hourlyRate={getHourlyRate(selectedVehicle)}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Success message after booking */}
          <AnimatePresence>
            {bookingSubmitted && (
              <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                className="bg-green-100 border-l-4 border-green-500 p-4 mb-8 rounded"
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-green-700 font-medium">
                      {t('booking.bookingConfirmed')} <span className="font-mono">{bookingReference}</span>
                    </p>
                    <p className="text-green-600 text-sm">
                      {t('booking.confirmationEmailSent')}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Service Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-gray-50 rounded-lg p-8 mb-16"
          >
            <h2 className="text-2xl font-bold text-primary mb-6">{t("chauffeur.serviceTypes.rental.title")}</h2>
            <p className="text-gray-700 mb-8">{t("chauffeur.serviceTypes.rental.description")}</p>

            <h3 className="text-xl font-semibold text-primary mb-4">{t('chauffeur.serviceBenefits')}</h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
              {Array.from({ length: 5 }, (_, i) => (
                <li key={i} className="flex items-start">
                  <StarIcon className="h-5 w-5 text-secondary mr-2 mt-1 flex-shrink-0" />
                  <span>{t(`chauffeur.serviceTypes.rental.benefits.${i}`)}</span>
                </li>
              ))}
            </ul>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
                <ClockIcon className="h-10 w-10 text-secondary mb-3" />
                <h3 className="text-lg font-semibold mb-2">{t('chauffeur.hoursOfAvailability')}</h3>
                <p className="text-gray-600">{t('chauffeur.hoursOfAvailabilityText')}</p>
              </div>

              <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
                <UserIcon className="h-10 w-10 text-secondary mb-3" />
                <h3 className="text-lg font-semibold mb-2">{t('chauffeur.professionalChauffeurs')}</h3>
                <p className="text-gray-600">{t('chauffeur.professionalChauffeursText')}</p>
              </div>

              <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
                <CurrencyDollarIcon className="h-10 w-10 text-secondary mb-3" />
                <h3 className="text-lg font-semibold mb-2">{t('chauffeur.transparentPricing')}</h3>
                <p className="text-gray-600">{t('chauffeur.transparentPricingText')}</p>
              </div>
            </div>
          </motion.div>

          {/* Available Vehicles */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-primary mb-8 text-center">{t('chauffeur.ourPremiumFleet')}</h2>
            <p className="text-center text-gray-600 mb-8">
              {t('chauffeur.selectVehicleText')}
            </p>

            {loadingVehicles && (
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center text-gray-500">
                {t("chauffeur.loadingVehicles", { defaultValue: "Loading vehicles..." })}
              </div>
            )}

            {!loadingVehicles && vehiclesError && (
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center text-red-500 space-y-4">
                <p>{vehiclesError}</p>
                <button
                  type="button"
                onClick={refetchVehicles}
                  className="px-4 py-2 rounded-lg border border-red-300 text-red-600 hover:bg-red-50"
                >
                  {t("transfer.retry", { defaultValue: "Retry" })}
                </button>
              </div>
            )}

            {!loadingVehicles && !vehiclesError && (
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {filteredVehicles.map((vehicle) => {
                  const hourlyRate = getHourlyRate(vehicle);
                  const description =
                    t(`chauffeur.vehicleDescriptions.${vehicle.slug}`, {
                      defaultValue: vehicle.descriptionShort || vehicle.descriptionLong || "",
                    }) || vehicle.descriptionShort || vehicle.descriptionLong;

                  return (
                    <motion.div
                      key={vehicle.slug}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="relative h-60">
                          <img
                            src={vehicle.mainImage ?? undefined}
                            alt={vehicle.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-0 left-0 bg-secondary text-white px-3 py-1 rounded-br-lg font-medium">
                            €{hourlyRate}/hour
                          </div>
                        </div>
                        <div className="p-6">
                          <h3 className="text-xl font-bold text-primary mb-2">{vehicle.name}</h3>
                          <p className="text-gray-600 mb-4">
                            {description}
                          </p>

                          <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="flex items-center">
                              <UserIcon className="h-5 w-5 text-secondary mr-2" />
                              <span>
                                {t("transfer.upTo")} {vehicle.passengerCapacity} {t("transfer.passengers")}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <TruckIcon className="h-5 w-5 text-secondary mr-2" />
                              <span>
                                {vehicle.luggageCapacity} {t("transfer.luggage")}
                              </span>
                            </div>
                          </div>

                          {vehicle.features.length > 0 && (
                            <div className="mb-6">
                              <h4 className="font-medium text-gray-700 mb-2">{t("chauffeur.featuresLabel")}</h4>
                              <ul className="space-y-1">
                                {vehicle.features.slice(0, 4).map((feature, index) => (
                                  <li key={index} className="flex items-center text-sm text-gray-600">
                                    <svg className="h-4 w-4 text-secondary mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                    {t(`chauffeur.features.${feature}`, { defaultValue: feature })}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          <button
                            onClick={() => handleSelectVehicle(vehicle)}
                            className="w-full py-3 px-4 bg-secondary text-white font-semibold rounded-md hover:bg-secondary-dark transition-colors"
                          >
                            {t("chauffeur.booking.bookNow")}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {!loadingVehicles && !vehiclesError && filteredVehicles.length === 0 && (
              <div className="bg-gray-100 p-8 rounded-lg text-center my-8">
                <h3 className="text-2xl font-bold text-gray-700 mb-2">{t('chauffeur.noVehiclesAvailable')}</h3>
                <p className="text-gray-600">
                  {t('chauffeur.noVehiclesText')}
                </p>
              </div>
            )}
          </div>

          {/* Call to Action */}
          <div className="bg-primary text-white p-10 rounded-lg text-center mt-12">
            <h2 className="text-2xl font-bold mb-4">{t('chauffeur.needHelp')}</h2>
            <p className="mb-6 max-w-2xl mx-auto">
              {t('chauffeur.needHelpText')}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="/contact"
                className="btn-gold px-6 py-3 font-medium"
              >
                {t('chauffeur.contactUs')}
              </a>
              <a
                href="tel:+905431568648"
                className="bg-white text-primary border border-white hover:bg-opacity-90 px-6 py-3 rounded-md font-medium transition-colors"
              >
                {t('chauffeur.callNow')}
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
