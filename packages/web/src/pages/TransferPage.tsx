import { useState, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import Hero from "../components/Hero";
import TransferBookingForm, { TransferFormData } from "../components/TransferBookingForm";
import VehicleCard from "../components/VehicleCard";
import TransferBookingConfirmation from "../components/TransferBookingConfirmation";
import { usePublicVehicles } from "../hooks/public/usePublicVehicles";
import { PublicVehicle, VehicleWithPrice } from "../types/public/PublicVehicle";
import { TransferType } from "../types/transfer";
import { calculateTransferPrice } from "../api/public/pricingApi";
import { getRoute } from "../api/public/mapsApi";

// Images
import heroImage from "../assets/images/vehicles/mercedes-s-class-airport.jpg";

export default function TransferPage({ initialTransferType }: { initialTransferType?: TransferType }) {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useState<TransferFormData | null>(null);
  const {
    vehicles,
    loading: loadingVehicles,
    error: vehiclesError,
    refetch: refetchVehicles,
  } = usePublicVehicles();
  const [filteredVehicles, setFilteredVehicles] = useState<VehicleWithPrice[]>([]);
  const [showVehicles, setShowVehicles] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleWithPrice | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [locations, setLocations] = useState<{
    fromName: string;
    toName: string;
    distance?: number;
    time?: string;
    travelTime?: string;
  } | null>(null);

  // Handle form search - wrapped in useCallback to prevent recreating the function on each render
  const handleSearch = useCallback(
    async (formData: TransferFormData) => {
      setSearchParams(formData);
      setShowVehicles(true);

      const transferVehicles = vehicles.filter((vehicle) => vehicle.types && vehicle.types.includes("transfer"));

      const filtered = transferVehicles.filter(
        (vehicle) =>
          vehicle.passengerCapacity >= formData.passengers &&
          vehicle.luggageCapacity >= formData.luggage
      );

      // Validate that locations are selected with coordinates
      if (!formData.fromLocation || !formData.toLocation) {
        alert(t("transfer.locationError", { defaultValue: "Please select both pickup and dropoff locations." }));
        return;
      }

      const fromName = formData.fromLocation.description;
      const toName = formData.toLocation.description;

      let realDistance = 0;
      let durationMin = 0;
      let travelTime = "";

      // Fetch distance and ETA from backend using coordinates from Google Autocomplete
      try {
        const routeResponse = await getRoute({
          fromLat: formData.fromLocation.lat,
          fromLng: formData.fromLocation.lng,
          toLat: formData.toLocation.lat,
          toLng: formData.toLocation.lng,
        });
        realDistance = routeResponse.distanceKm;
        durationMin = routeResponse.durationInTrafficMin || routeResponse.durationMin;
        travelTime = `${durationMin} min`;
      } catch (error) {
        console.error("Error fetching route from backend:", error);
        // If backend fails, we cannot proceed without distance
        alert(t("transfer.routeCalculationError", { defaultValue: "Unable to calculate route. Please try again." }));
        return;
      }

      setLocations({
        fromName,
        toName,
        distance: realDistance,
        time: formData.time,
        travelTime: travelTime,
      });

      // Calculate prices from backend - MUST use transfer price, never basePrice
      const vehiclesWithPricePromises = filtered.map(async (vehicle) => {
        try {
          const priceResponse = await calculateTransferPrice({
            vehicleId: vehicle.id.toString(),
            distanceKm: realDistance,
            roundTrip: formData.roundTrip || false,
          });
            const price = priceResponse.price;
            return {
              ...vehicle,
              price, // This is transfer price from backend (distanceKm × kmPrice, ×2 if roundTrip)
            } as VehicleWithPrice;
        } catch (error) {
          console.error(`Error calculating transfer price for vehicle ${vehicle.id}:`, error);
          // If backend fails, don't show vehicle
          // DO NOT use basePrice as fallback - it's not a transfer price
          return null;
        }
      });

      const vehiclesWithPriceResults = await Promise.all(vehiclesWithPricePromises);
      
      // Filter out null values (vehicles that failed to get transfer price)
      const validVehicles = vehiclesWithPriceResults.filter((v): v is VehicleWithPrice => v !== null);

      setFilteredVehicles(validVehicles);

      // Scroll to vehicles section
      setTimeout(() => {
        const vehiclesElement = document.getElementById("vehicles-section");
        if (vehiclesElement) {
          vehiclesElement.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    },
    [vehicles]
  );

  // Handle round trip change - recalculate prices when checkbox changes
  const handleRoundTripChange = useCallback(
    (roundTrip: boolean) => {
      // When round trip checkbox changes, recalculate prices if vehicles are already shown
      if (showVehicles && searchParams && locations?.distance) {
        const filtered = vehicles
          .filter((v) => v.types && v.types.includes("transfer"))
          .filter(
            (v) =>
              v.passengerCapacity >= searchParams.passengers &&
              v.luggageCapacity >= searchParams.luggage
          );

        const vehiclesWithPricePromises = filtered.map(async (vehicle) => {
          try {
            const priceResponse = await calculateTransferPrice({
              vehicleId: vehicle.id.toString(),
              distanceKm: locations.distance!,
              roundTrip: roundTrip,
            });
            return {
              ...vehicle,
              price: priceResponse.price,
            } as VehicleWithPrice;
          } catch (error) {
            console.error(`Error calculating transfer price for vehicle ${vehicle.id}:`, error);
            return null;
          }
        });

        Promise.all(vehiclesWithPricePromises).then((results) => {
          const validVehicles = results.filter((v): v is VehicleWithPrice => v !== null);
          setFilteredVehicles(validVehicles);
        });
      }
    },
    [showVehicles, searchParams, locations, vehicles]
  );

  // Handle vehicle selection
  const handleSelectVehicle = async (vehicle: VehicleWithPrice) => {
    // If price is already calculated (transfer price from backend), use it
    if (vehicle.price) {
      setSelectedVehicle(vehicle);
      setShowModal(true);
      return;
    }

    // Otherwise, calculate transfer price from backend
    const distance = locations?.distance || 0;
    if (!distance) {
      console.error("Cannot calculate transfer price: distance is required");
      return;
    }

    try {
      const priceResponse = await calculateTransferPrice({
        vehicleId: vehicle.id.toString(),
        distanceKm: distance,
        roundTrip: searchParams?.roundTrip || false,
      });
      const price = priceResponse.price; // Transfer price from backend

      setSelectedVehicle({
        ...vehicle,
        price, // Transfer price, NOT basePrice
      });
      setShowModal(true);
    } catch (error) {
      console.error("Error calculating transfer price:", error);
      // DO NOT use basePrice - show error or don't proceed
      alert(t("transfer.priceCalculationError", { defaultValue: "Unable to calculate transfer price. Please try again." }));
    }
  };

  return (
    <>
      <Hero
        title={t("transfer.title")}
        subtitle={t("transfer.subtitle")}
        backgroundImage={heroImage}
        overlayOpacity={0.6}
      />

      <section className="py-20">
        <div className="container mx-auto px-4">
            <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto mb-12 max-w-3xl text-center"
          >
            <h1 className="mb-4 text-4xl font-bold text-primary">{t("transfer.title")}</h1>
            <p className="text-lg text-gray-600">{t("transfer.subtitle")}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto max-w-4xl"
          >
            <TransferBookingForm 
              onSearch={handleSearch} 
              initialTransferType={initialTransferType}
              onRoundTripChange={handleRoundTripChange}
            />
          </motion.div>
        </div>
      </section>

      {showVehicles && filteredVehicles.length > 0 && (
        <section id="vehicles-section" className="bg-gray-50 py-16">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="mb-10 text-center"
            >
              <h2 className="mb-4 text-3xl font-bold text-primary">
                {locations && (
                  <>
                    {locations.fromName} <span className="text-secondary">→</span> {locations.toName}
                  </>
                )}
              </h2>
              <p className="text-gray-600">
                {searchParams?.roundTrip
                  ? t('transfer.roundTripAvailable')
                  : t('transfer.oneWayTrip')}
              </p>
              {locations?.distance && (
                <p className="mt-2 text-gray-600">
                  {t('transfer.estimatedDistance')}: {locations.distance} km
                </p>
              )}
              {locations?.travelTime && (
                <p className="mt-1 text-gray-600">
                  {t('transfer.estimatedTravelTime')}: {locations.travelTime}
                </p>
              )}
            </motion.div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {filteredVehicles.map((vehicle, index) => (
                <motion.div
                  key={`${vehicle.slug}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                >
                  <VehicleCard
                    vehicle={vehicle}
                    onSelectVehicle={handleSelectVehicle}
                    selectedRoute={
                      locations
                        ? {
                            from: locations.fromName,
                            to: locations.toName,
                            distance: locations.distance,
                            time: locations.time,
                          }
                        : undefined
                    }
                    transferType={searchParams?.transferType}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {showVehicles && loadingVehicles && (
        <section className="bg-gray-50 py-16">
          <div className="container mx-auto px-4">
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center text-gray-500">
              {t("transfer.loadingVehicles", { defaultValue: "Loading vehicles..." })}
            </div>
          </div>
        </section>
      )}

      {showVehicles && !loadingVehicles && vehiclesError && (
        <section className="bg-gray-50 py-16">
          <div className="container mx-auto px-4">
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
          </div>
        </section>
      )}

      {/* No results section */}
      {showVehicles && !loadingVehicles && !vehiclesError && filteredVehicles.length === 0 && (
        <section className="bg-gray-50 py-16">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <div className="mx-auto max-w-lg rounded-lg bg-white p-8 shadow-md">
                <h3 className="mb-4 text-2xl font-bold text-primary">
                  {t('transfer.noVehiclesAvailable')}
                </h3>
                <p className="mb-6 text-gray-600">
                  {t('transfer.noVehiclesMessage')}
                </p>
                <button
                  onClick={() => setShowVehicles(false)}
                  className="btn-gold px-6 py-3"
                >
                  {t('transfer.modifySearch')}
                </button>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Why choose us section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-primary">
              {t('transfer.whyChooseUs')}
            </h2>
            <p className="mx-auto max-w-2xl text-gray-600">
              {t('transfer.whyChooseUsSubtitle')}
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Feature 1 */}
            <div className="rounded-lg bg-white p-6 shadow-md transition-all hover:shadow-lg">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-secondary/10 text-secondary">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-primary">
                {t('transfer.punctuality')}
              </h3>
              <p className="text-gray-600">
                {t('transfer.punctualityText')}
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-lg bg-white p-6 shadow-md transition-all hover:shadow-lg">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-secondary/10 text-secondary">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-primary">
                {t('transfer.safety')}
              </h3>
              <p className="text-gray-600">
                {t('transfer.safetyText')}
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-lg bg-white p-6 shadow-md transition-all hover:shadow-lg">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-secondary/10 text-secondary">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-primary">
                {t('transfer.comfort')}
              </h3>
              <p className="text-gray-600">
                {t('transfer.comfortText')}
              </p>
            </div>

            {/* Feature 4 */}
            <div className="rounded-lg bg-white p-6 shadow-md transition-all hover:shadow-lg">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-secondary/10 text-secondary">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-primary">
                {t('transfer.affordability')}
              </h3>
              <p className="text-gray-600">
                {t('transfer.affordabilityText')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Booking confirmation modal */}
      <TransferBookingConfirmation
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        vehicle={selectedVehicle}
        transferData={searchParams}
        locations={locations}
      />
    </>
  );
}
