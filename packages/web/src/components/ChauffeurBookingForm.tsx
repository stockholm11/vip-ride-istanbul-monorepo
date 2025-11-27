import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ClockIcon, MapPinIcon, CalendarIcon, UserIcon, TruckIcon, CheckCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { PublicVehicle } from "../types/public/PublicVehicle";
import ChauffeurBookingConfirmation from "./ChauffeurBookingConfirmation";
import { calculateChauffeurPrice } from '../api/public/pricingApi';
import { createReservation } from '../api/public';
import { chargePayment } from '../api/public/publicPaymentApi';
import GoogleAutocomplete from "./GoogleAutocomplete";
import AddOnsAccordion from "./AddOnsAccordion";
import { getPublicAddOns, PublicAddOn } from '../api/public/publicAddOnsApi';

interface ChauffeurBookingFormProps {
  vehicle: PublicVehicle;
  onSubmit: (formData: ChauffeurBookingData) => void;
  onCancel: () => void;
  hourlyRate?: number;
}

interface PassengerInfo {
  firstName: string;
  lastName: string;
}

export interface ChauffeurBookingData {
  vehicleId: string;
  pickupDate: string;
  pickupTime: string;
  pickupLocation: string;
  dropoffLocation: string;
  duration: number;
  passengers: number;
  specialRequests: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  paymentMethod: "cash" | "creditCard";
  // Corporate invoice option
  requiresCorporateInvoice: boolean;
  // Additional passengers
  additionalPassengers: PassengerInfo[];
  // Billing information
  firstName: string;
  lastName: string;
  billingAddress: string;
  billingCity: string;
  billingCountry: string;
  billingZipCode: string;
  // Card information
  cardNumber?: string;
  cardHolderName?: string;
  expiryDate?: string;
  cvv?: string;
}

export default function ChauffeurBookingForm({
  vehicle,
  onSubmit,
  onCancel,
  hourlyRate
}: ChauffeurBookingFormProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const today = new Date().toISOString().split('T')[0];

  // Initialize form state
  const [formData, setFormData] = useState<ChauffeurBookingData>({
    vehicleId: vehicle.id.toString(),
    pickupDate: '',
    pickupTime: '',
    pickupLocation: '',
    dropoffLocation: '',
    duration: 4, // Default duration is 4 hours
    passengers: 1,
    specialRequests: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    paymentMethod: 'creditCard',
    // Corporate invoice option
    requiresCorporateInvoice: false,
    // Additional passengers
    additionalPassengers: [],
    // Billing information
    firstName: '',
    lastName: '',
    billingAddress: '',
    billingCity: 'Istanbul',
    billingCountry: 'Turkey',
    billingZipCode: '',
    // Card information
    cardNumber: '',
    cardHolderName: '',
    expiryDate: '',
    cvv: ''
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [confirmClicked, setConfirmClicked] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [bookingId, setBookingId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [totalPrice, setTotalPrice] = useState<number | null>(null);
  const [baseChauffeurPrice, setBaseChauffeurPrice] = useState<number | null>(null);
  const [loadingPrice, setLoadingPrice] = useState(false);
  const [selectedAddOns, setSelectedAddOns] = useState<Array<{
    addOnId: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>>([]);
  const [addOns, setAddOns] = useState<PublicAddOn[]>([]);

  // Generate a random booking ID
  const generateBookingId = () => {
    return `CHF-${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`;
  };

  // Fetch total price from backend when duration changes
  useEffect(() => {
    const fetchPrice = async () => {
      if (formData.duration && formData.duration > 0) {
        setLoadingPrice(true);
        try {
          const priceResponse = await calculateChauffeurPrice({
            vehicleId: vehicle.id.toString(),
            durationHours: formData.duration,
          });
          const basePrice = priceResponse.price;
          setBaseChauffeurPrice(basePrice);
          const addOnsTotal = selectedAddOns.reduce((sum, addOn) => sum + addOn.totalPrice, 0);
          setTotalPrice(basePrice + addOnsTotal);
        } catch (error) {
          console.error("Error calculating chauffeur price:", error);
          setTotalPrice(null);
          setBaseChauffeurPrice(null);
        } finally {
          setLoadingPrice(false);
        }
      }
    };

    fetchPrice();
  }, [formData.duration, vehicle.id, selectedAddOns]);

  // Fetch add-ons for price breakdown display
  useEffect(() => {
    const fetchAddOns = async () => {
      try {
        const data = await getPublicAddOns();
        setAddOns(data);
      } catch (error) {
        console.error("Error fetching add-ons:", error);
      }
    };

    fetchAddOns();
  }, []);

  // Add validation function for date and time
  const isDateTimeValid = (selectedDate: string, selectedTime: string) => {
    const now = new Date();
    const selectedDateTime = new Date(`${selectedDate}T${selectedTime}`);
    
    // Add 1 hour buffer to prevent bookings too close to current time
    const bufferTime = new Date(now.getTime() + 60 * 60 * 1000);
    
    return selectedDateTime >= bufferTime;
  };

  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Special handling for date and time validation
    if (name === 'pickupDate' || name === 'pickupTime') {
      const newDate = name === 'pickupDate' ? value : formData.pickupDate;
      const newTime = name === 'pickupTime' ? value : formData.pickupTime;
      
      if (newDate && newTime) {
        if (!isDateTimeValid(newDate, newTime)) {
          alert(t('booking.invalidDateTime'));
          return;
        }
      }
    }

    // Kart numarası formatlaması
    if (name === 'cardNumber') {
      const formattedValue = value
        .replace(/\D/g, '') // Sadece sayıları al
        .replace(/(\d{4})/g, '$1 ') // Her 4 rakamdan sonra boşluk ekle
        .trim(); // Baştaki ve sondaki boşlukları temizle
      setFormData(prev => ({ ...prev, [name]: formattedValue }));
      return;
    }

    // Son kullanma tarihi formatlaması
    if (name === 'expiryDate') {
      const formattedValue = value
        .replace(/\D/g, '') // Sadece sayıları al
        .replace(/(\d{2})(\d{0,2})/, '$1/$2') // MM/YY formatı
        .substring(0, 5); // Maksimum 5 karakter (MM/YY)
      setFormData(prev => ({ ...prev, [name]: formattedValue }));
      return;
    }

    // CVV için sadece sayı girişi
    if (name === 'cvv') {
      const formattedValue = value.replace(/\D/g, '').substring(0, 4);
      setFormData(prev => ({ ...prev, [name]: formattedValue }));
      return;
    }

    // Ek yolcu alanları için özel handling
    if (name.startsWith('additionalPassenger_')) {
      const [_, passengerIndex, field] = name.split('_');
      const index = parseInt(passengerIndex);
      
      setFormData(prev => ({
        ...prev,
        additionalPassengers: prev.additionalPassengers.map((passenger, i) => 
          i === index ? { ...passenger, [field]: value } : passenger
        )
      }));
      return;
    }

    // Diğer alanlar için normal değişiklik
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Ek yolcu ekleme fonksiyonu
  const addAdditionalPassenger = () => {
    setFormData(prev => ({
      ...prev,
      additionalPassengers: [...prev.additionalPassengers, { firstName: '', lastName: '' }]
    }));
  };

  // Ek yolcu silme fonksiyonu
  const removeAdditionalPassenger = (index: number) => {
    setFormData(prev => ({
      ...prev,
      additionalPassengers: prev.additionalPassengers.filter((_, i) => i !== index)
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Only allow submission if user is on the Review & Confirm step
    if (currentStep === 3) {
      // Yolcu sayısı validasyonu
      if (formData.passengers > 1) {
        const requiredAdditionalPassengers = formData.passengers - 1;
        const currentAdditionalPassengers = formData.additionalPassengers.length;
        
        if (currentAdditionalPassengers < requiredAdditionalPassengers) {
          alert(t("payment.pleaseAddPassengers"));
          return;
        }
        
        // Ek yolcu bilgilerinin dolu olup olmadığını kontrol et
        const hasEmptyPassengerInfo = formData.additionalPassengers.some(
          passenger => !passenger.firstName.trim() || !passenger.lastName.trim()
        );
        
        if (hasEmptyPassengerInfo) {
          alert(t("payment.passengerDetailsRequired"));
          return;
        }
      }
      
      try {
        setIsSubmitting(true);
        
        // Use total price from backend (already calculated via useEffect)
        if (!totalPrice) {
          throw new Error(t('booking.priceCalculationError', { defaultValue: 'Unable to calculate price. Please try again.' }));
        }

        // Only credit card payment is allowed
          const fullName = `${formData.firstName} ${formData.lastName}`.trim() || formData.firstName || formData.lastName || "Guest";
          const pickupDatetime = formData.pickupDate && formData.pickupTime
            ? `${formData.pickupDate}T${formData.pickupTime}`
            : new Date().toISOString();

          // Validate required fields
          if (!formData.contactEmail || !formData.contactEmail.trim()) {
            throw new Error(t('booking.emailRequired', { defaultValue: 'Email is required' }));
          }
          if (!formData.pickupLocation || !formData.pickupLocation.trim()) {
            throw new Error(t('chauffeur.booking.pickupLocationRequired', { defaultValue: 'Pickup location is required' }));
          }
          if (!totalPrice || totalPrice <= 0) {
            throw new Error(t('booking.priceCalculationError', { defaultValue: 'Price calculation failed. Please try again.' }));
          }
          if (!fullName || !fullName.trim()) {
            throw new Error(t('booking.nameRequired', { defaultValue: 'Name is required' }));
          }

          // Create reservation first
          const reservation = await createReservation({
          type: "chauffeur",
            vehicleId: vehicle.id,
            userFullname: fullName,
            userFullName: fullName,
            userEmail: formData.contactEmail.trim(),
            userPhone: formData.contactPhone?.trim(),
            pickupLocation: formData.pickupLocation.trim(),
            dropoffLocation: formData.dropoffLocation?.trim(),
            pickupDatetime,
            passengers: formData.passengers,
            totalPrice: totalPrice,
          additionalPassengers: formData.additionalPassengers,
          addOns: selectedAddOns.map(addOn => ({
            addOnId: addOn.addOnId,
            quantity: addOn.quantity,
          })),
          });

          if (!reservation || !reservation.id) {
            throw new Error(t('booking.reservationFailed', { defaultValue: 'Reservation creation failed. Please try again.' }));
          }

          // Parse expiry date (MM/YY format)
          const expiryParts = formData.expiryDate?.split('/') || [];
          const expireMonth = expiryParts[0]?.trim() || '';
          const expireYear = expiryParts[1]?.trim() ? `20${expiryParts[1].trim()}` : '';

          // Prepare buyer info
          const buyer = {
            id: reservation.id.toString(),
              name: formData.firstName,
              surname: formData.lastName,
            gsmNumber: formData.contactPhone || '',
            email: formData.contactEmail.trim(),
            identityNumber: "11111111111",
            registrationAddress: formData.billingAddress || formData.pickupLocation || "Istanbul",
            ip: "0.0.0.0",
            city: formData.billingCity || "Istanbul",
            country: formData.billingCountry || "Turkey",
            zipCode: formData.billingZipCode || "34000",
          };

          // Prepare billing address
          const billingAddress = {
            contactName: fullName,
            city: formData.billingCity || "Istanbul",
            country: formData.billingCountry || "Turkey",
            address: formData.billingAddress || formData.pickupLocation || "Istanbul",
            zipCode: formData.billingZipCode || "34000",
          };

          // Prepare shipping address
          const shippingAddress = {
            contactName: fullName,
            city: formData.billingCity || "Istanbul",
            country: formData.billingCountry || "Turkey",
            address: formData.pickupLocation || formData.billingAddress || "Istanbul",
            zipCode: formData.billingZipCode || "34000",
          };

          // Prepare basket items
          const basketItems = [
              {
              id: reservation.id.toString(),
              name: vehicle.name || "VIP Ride Chauffeur",
              category1: "Chauffeur",
              itemType: "PHYSICAL",
              price: totalPrice.toFixed(2),
            },
          ];

          const chargeResponse = await chargePayment({
            reservationId: reservation.id,
            price: totalPrice,
            paidPrice: totalPrice,
            currency: "EUR",
            cardHolderName: formData.cardHolderName || '',
            cardNumber: formData.cardNumber?.replace(/\s/g, '') || '',
            expireMonth,
            expireYear,
            cvc: formData.cvv || '',
            buyer,
            billingAddress,
            shippingAddress,
            basketItems,
          });

          console.log("[Booking] chargeResponse:", chargeResponse);

          if (chargeResponse?.success) {
            navigate(`/${i18n.language}/payment-success`);
          } else {
            navigate(`/${i18n.language}/payment-failed`);
        }
      } catch (error) {
        console.error('Booking error:', error);
        const message =
          (error as { response?: { data?: { message?: string } } })?.response?.data
            ?.message || (error instanceof Error ? error.message : null);
        alert(message || t('booking.bookingError'));
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Navigation between steps
  const nextStep = () => {
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  // Check if current step is complete
  const isStepComplete = () => {
    switch (currentStep) {
      case 1: // Trip details
        return (
          formData.pickupDate !== '' &&
          formData.pickupTime !== '' &&
          formData.pickupLocation !== '' &&
          formData.dropoffLocation !== ''
        );
      case 2: // Contact info
        return (
          formData.firstName !== '' &&
          formData.lastName !== '' &&
          formData.contactEmail !== '' &&
          formData.contactPhone !== ''
        );
      case 3: // Review & Confirm
        // User must manually click confirm on step 3
        return true;
      default:
        return false;
    }
  };

  // Render different form steps
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderTripDetailsStep();
      case 2:
        return renderContactInfoStep();
      case 3:
        return renderSummaryStep();
      default:
        return null;
    }
  };

  // Trip details form
  const renderTripDetailsStep = () => {
    return (
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-primary">{t("chauffeur.booking.tripDetails")}</h3>

        {/* Pickup/Dropoff Locations */}
        <div className="space-y-4">
          <div>
            <label htmlFor="pickupLocation" className="block text-sm font-medium text-gray-700 mb-1">
              {t("chauffeur.booking.pickupLocation")} *
            </label>
            <div className="relative">
              <GoogleAutocomplete
                id="pickupLocation"
                name="pickupLocation"
                value={formData.pickupLocation}
                onChange={(value) => {
                  setFormData((prev) => ({ ...prev, pickupLocation: value }));
                }}
                placeholder={t("chauffeur.booking.pickupLocation")}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring focus:ring-secondary focus:ring-opacity-50 pl-10 py-2"
                required
              />
              <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div>
            <label htmlFor="dropoffLocation" className="block text-sm font-medium text-gray-700 mb-1">
              {t("chauffeur.booking.dropoffLocation")} *
            </label>
            <div className="relative">
              <GoogleAutocomplete
                id="dropoffLocation"
                name="dropoffLocation"
                value={formData.dropoffLocation}
                onChange={(value) => {
                  setFormData((prev) => ({ ...prev, dropoffLocation: value }));
                }}
                placeholder={t("chauffeur.booking.dropoffLocation")}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring focus:ring-secondary focus:ring-opacity-50 pl-10 py-2"
                required
              />
              <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Pickup Date and Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="pickupDate" className="block text-sm font-medium text-gray-700 mb-1">
              {t("chauffeur.booking.pickupDate")} *
            </label>
            <div className="relative">
              <input
                type="date"
                id="pickupDate"
                name="pickupDate"
                min={today}
                value={formData.pickupDate}
                onChange={handleChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring focus:ring-secondary focus:ring-opacity-50 pl-10 py-2 text-base"
                required
              />
              <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          </div>

          <div>
            <label htmlFor="pickupTime" className="block text-sm font-medium text-gray-700 mb-1">
              {t("chauffeur.booking.pickupTime")} *
            </label>
            <div className="relative">
              <select
                id="pickupTime"
                name="pickupTime"
                value={formData.pickupTime}
                onChange={handleChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring focus:ring-secondary focus:ring-opacity-50 pl-10 py-2"
                required
              >
                <option value="">{t("booking.selectTime")}</option>
                {Array.from({ length: 24 }).map((_, i) => (
                  <option key={i} value={`${i.toString().padStart(2, '0')}:00`}>
                    {`${i.toString().padStart(2, '0')}:00`}
                  </option>
                ))}
              </select>
              <ClockIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Duration and Passengers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
              {t("chauffeur.booking.duration")} *
            </label>
            <div className="relative">
              <select
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring focus:ring-secondary focus:ring-opacity-50 pl-10 py-2"
                required
              >
                <option value="4">4 {t("chauffeur.hours")} ({t("booking.minimum")})</option>
                <option value="6">6 {t("chauffeur.hours")}</option>
                <option value="8">8 {t("chauffeur.hours")}</option>
                <option value="10">10 {t("chauffeur.hours")}</option>
                <option value="12">12 {t("chauffeur.hours")}</option>
                <option value="24">24 {t("chauffeur.hours")} ({t("chauffeur.dailyService")})</option>
              </select>
              <ClockIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          </div>

          <div>
            <label htmlFor="passengers" className="block text-sm font-medium text-gray-700 mb-1">
              {t("chauffeur.booking.passengers")} *
            </label>
            <div className="relative">
              <select
                id="passengers"
                name="passengers"
                value={formData.passengers}
                onChange={handleChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring focus:ring-secondary focus:ring-opacity-50 pl-10 py-2"
                required
              >
                {[...Array(vehicle.passengerCapacity)].map((_, i) => (
                  <option key={i+1} value={i+1}>{i+1}</option>
                ))}
              </select>
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
            <p className="text-xs text-gray-500 mt-1">{t("booking.maximum")}: {vehicle.passengerCapacity} {t("transfer.passengers")}</p>
          </div>
        </div>

        {/* Add-Ons Section */}
        <div className="mb-6">
          <AddOnsAccordion
            selectedAddOns={selectedAddOns}
            onAddOnsChange={setSelectedAddOns}
          />
        </div>

        {/* Special Requests */}
        <div>
          <label htmlFor="specialRequests" className="block text-sm font-medium text-gray-700 mb-1">
            {t("chauffeur.booking.specialRequests")}
          </label>
          <textarea
            id="specialRequests"
            name="specialRequests"
            rows={3}
            value={formData.specialRequests}
            onChange={handleChange}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring focus:ring-secondary focus:ring-opacity-50"
            placeholder={t("booking.addSpecialRequests")}
          ></textarea>
        </div>

        {/* Additional Passengers Section */}
        {formData.passengers > 1 && (
          <div className="border-t pt-6 mt-6">
            <h4 className="text-lg font-semibold mb-4">{t("payment.additionalPassengers")}</h4>
            <p className="text-sm text-gray-600 mb-4">
              {t("booking.firstName")} ve {t("booking.lastName")} bilgilerini giriniz.
            </p>
            
            {formData.additionalPassengers.map((passenger, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg mb-4">
                <div className="flex justify-between items-center mb-3">
                  <h5 className="font-medium text-gray-700">
                    {t("payment.passengerNumber")} {index + 2}
                  </h5>
                  <button
                    type="button"
                    onClick={() => removeAdditionalPassenger(index)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    {t("payment.removePassenger")}
                  </button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("booking.firstName")} *
                    </label>
                    <input
                      type="text"
                      name={`additionalPassenger_${index}_firstName`}
                      value={passenger.firstName}
                      onChange={handleChange}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring focus:ring-secondary focus:ring-opacity-50 text-base"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("booking.lastName")} *
                    </label>
                    <input
                      type="text"
                      name={`additionalPassenger_${index}_lastName`}
                      value={passenger.lastName}
                      onChange={handleChange}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring focus:ring-secondary focus:ring-opacity-50 text-base"
                      required
                    />
                  </div>
                </div>
              </div>
            ))}
            
            {formData.additionalPassengers.length < formData.passengers - 1 && (
              <button
                type="button"
                onClick={addAdditionalPassenger}
                className="w-full py-2 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-secondary hover:text-secondary transition-colors"
              >
                + {t("payment.addPassenger")}
              </button>
            )}
            
            {/* Validation warning */}
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>{t("payment.passengerDetailsRequired")}</strong>
              </p>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Contact information form
  const renderContactInfoStep = () => {
    return (
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-primary">{t("chauffeur.booking.contactInfo")}</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
              {t("booking.firstName")} *
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring focus:ring-secondary focus:ring-opacity-50 py-2 text-base"
              required
            />
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
              {t("booking.lastName")} *
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring focus:ring-secondary focus:ring-opacity-50 py-2 text-base"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-1">
            {t("chauffeur.booking.email")} *
          </label>
          <input
            type="email"
            id="contactEmail"
            name="contactEmail"
            value={formData.contactEmail}
            onChange={handleChange}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring focus:ring-secondary focus:ring-opacity-50 py-2 text-base"
            required
          />
        </div>

        <div>
          <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-1">
            {t("chauffeur.booking.phoneNumber")} *
          </label>
          <input
            type="tel"
            id="contactPhone"
            name="contactPhone"
            value={formData.contactPhone}
            onChange={handleChange}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring focus:ring-secondary focus:ring-opacity-50 py-2 text-base"
            placeholder="+90 5XX XXX XXXX"
            required
          />
        </div>

        {/* Corporate Invoice Option */}
        <div className="border-t pt-6 mt-6">
          <h4 className="text-lg font-semibold mb-4">{t("payment.corporateInvoice")}</h4>
          
          <div className="mb-4">
            <label className="flex items-center p-3 rounded-lg border-2 cursor-pointer hover:border-gray-300">
              <input
                type="checkbox"
                name="requiresCorporateInvoice"
                checked={formData.requiresCorporateInvoice}
                onChange={(e) => {
                  const isChecked = e.target.checked;
                  setFormData(prev => ({ 
                    ...prev, 
                    requiresCorporateInvoice: isChecked,
                    // Reset billing address fields when unchecked
                    billingAddress: isChecked ? prev.billingAddress : '',
                    billingCity: isChecked ? prev.billingCity : 'Istanbul',
                    billingCountry: isChecked ? prev.billingCountry : 'Turkey',
                    billingZipCode: isChecked ? prev.billingZipCode : ''
                  }));
                }}
                className="h-4 w-4 text-secondary focus:ring-secondary border-gray-300 rounded"
              />
              <span className="ml-3 text-sm font-medium text-gray-700">
                {t("payment.corporateInvoiceDescription")}
              </span>
            </label>
          </div>

          {/* Conditional Billing Address section */}
          {formData.requiresCorporateInvoice && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h5 className="text-md font-medium text-gray-700 mb-3">
                {t("payment.billingAddress")}
                <span className="text-xs text-gray-500 ml-2">({t("payment.corporateInvoiceRequired")})</span>
              </h5>
              
              <div>
                <label htmlFor="billingAddress" className="block text-sm font-medium text-gray-700 mb-1">
                  {t("payment.address")} *
                </label>
                <input
                  type="text"
                  id="billingAddress"
                  name="billingAddress"
                  value={formData.billingAddress}
                  onChange={handleChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring focus:ring-secondary focus:ring-opacity-50 py-2 text-base"
                  required={formData.requiresCorporateInvoice}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div>
                  <label htmlFor="billingCity" className="block text-sm font-medium text-gray-700 mb-1">
                    {t("payment.city")} *
                  </label>
                  <input
                    type="text"
                    id="billingCity"
                    name="billingCity"
                    value={formData.billingCity}
                    onChange={handleChange}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring focus:ring-secondary focus:ring-opacity-50 py-2 text-base"
                    required={formData.requiresCorporateInvoice}
                  />
                </div>

                <div>
                  <label htmlFor="billingCountry" className="block text-sm font-medium text-gray-700 mb-1">
                    {t("payment.country")} *
                  </label>
                  <input
                    type="text"
                    id="billingCountry"
                    name="billingCountry"
                    value={formData.billingCountry}
                    onChange={handleChange}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring focus:ring-secondary focus:ring-opacity-50 py-2 text-base"
                    required={formData.requiresCorporateInvoice}
                  />
                </div>

                <div>
                  <label htmlFor="billingZipCode" className="block text-sm font-medium text-gray-700 mb-1">
                    {t("payment.zipCode")} *
                  </label>
                  <input
                    type="text"
                    id="billingZipCode"
                    name="billingZipCode"
                    value={formData.billingZipCode}
                    onChange={handleChange}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring focus:ring-secondary focus:ring-opacity-50 py-2 text-base"
                    required={formData.requiresCorporateInvoice}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-gray-50 p-4 rounded-md text-sm text-gray-600">
          <p>{t('booking.requiredFields')}</p>
        </div>
      </div>
    );
  };

  // Booking summary
  const renderSummaryStep = () => {
    // Use total price from backend (calculated via useEffect)

    return (
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-primary">{t("chauffeur.booking.reviewConfirm")}</h3>

        {/* Trip Summary */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-3">{t("chauffeur.booking.tripDetails")}</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">{t("chauffeur.booking.pickupLocation")}:</span>
              <span className="font-medium">{formData.pickupLocation}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{t("chauffeur.booking.dropoffLocation")}:</span>
              <span className="font-medium">{formData.dropoffLocation}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{t("chauffeur.booking.pickupDate")}:</span>
              <span className="font-medium">{formData.pickupDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{t("chauffeur.booking.pickupTime")}:</span>
              <span className="font-medium">{formData.pickupTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{t("chauffeur.booking.duration")}:</span>
              <span className="font-medium">{formData.duration} {t("chauffeur.hours")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{t("chauffeur.booking.passengers")}:</span>
              <span className="font-medium">{formData.passengers}</span>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-3">{t("chauffeur.booking.contactInfo")}</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">{t("chauffeur.booking.fullName")}:</span>
              <span className="font-medium">{formData.firstName} {formData.lastName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{t("chauffeur.booking.email")}:</span>
              <span className="font-medium">{formData.contactEmail}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{t("chauffeur.booking.phoneNumber")}:</span>
              <span className="font-medium">{formData.contactPhone}</span>
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-3">{t("booking.paymentMethod")}</h4>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex items-center p-3 rounded-lg border-2 border-gray-200 bg-gray-100 cursor-not-allowed">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cash"
                  disabled
                  className="h-4 w-4 text-secondary border-gray-300"
                />
                <span className="ml-2 text-sm font-medium text-gray-500">{t("booking.cash")}</span>
              </label>

              <label className={`
                flex items-center p-3 rounded-lg border-2 cursor-pointer
                ${formData.paymentMethod === 'creditCard' ? 'border-secondary bg-secondary/10' : 'border-gray-200 hover:border-gray-300'}
              `}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="creditCard"
                  checked={formData.paymentMethod === 'creditCard'}
                  onChange={handleChange}
                  className="h-4 w-4 text-secondary focus:ring-secondary border-gray-300"
                />
                <span className="ml-2 text-sm font-medium">{t("booking.creditCard")}</span>
              </label>
            </div>

            {/* Credit Card Form Fields */}
            {formData.paymentMethod === 'creditCard' && (
              <div className="mt-4 space-y-4">
                <div>
                  <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    {t("payment.cardNumber")} *
                  </label>
                  <input
                    type="text"
                    id="cardNumber"
                    name="cardNumber"
                    value={formData.cardNumber || ''}
                    onChange={handleChange}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring focus:ring-secondary focus:ring-opacity-50"
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    required={formData.paymentMethod === 'creditCard'}
                  />
                </div>

                <div>
                  <label htmlFor="cardHolderName" className="block text-sm font-medium text-gray-700 mb-1">
                    {t("payment.cardholderName")} *
                  </label>
                  <input
                    type="text"
                    id="cardHolderName"
                    name="cardHolderName"
                    value={formData.cardHolderName || ''}
                    onChange={handleChange}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring focus:ring-secondary focus:ring-opacity-50"
                    placeholder="JOHN DOE"
                    required={formData.paymentMethod === 'creditCard'}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">
                      {t("payment.expiryDate")} *
                    </label>
                    <input
                      type="text"
                      id="expiryDate"
                      name="expiryDate"
                      value={formData.expiryDate || ''}
                      onChange={handleChange}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring focus:ring-secondary focus:ring-opacity-50 text-base"
                      placeholder="MM/YY"
                      maxLength={5}
                      required={formData.paymentMethod === 'creditCard'}
                    />
                  </div>

                  <div>
                    <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">
                      {t("payment.cvv")} *
                    </label>
                    <input
                      type="text"
                      id="cvv"
                      name="cvv"
                      value={formData.cvv || ''}
                      onChange={handleChange}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring focus:ring-secondary focus:ring-opacity-50 text-base"
                      placeholder="123"
                      maxLength={4}
                      required={formData.paymentMethod === 'creditCard'}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Special Requests */}
        {formData.specialRequests && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">{t("chauffeur.booking.specialRequests")}</h4>
            <p className="text-sm text-gray-600">{formData.specialRequests}</p>
          </div>
        )}

        {/* Price Breakdown */}
        <div className="border-t border-gray-200 pt-6 mt-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">{t('chauffeur.priceBreakdown', { defaultValue: 'Fiyat Detayı' })}</h4>
          <div className="space-y-3">
            {/* Chauffeur Service */}
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <span className="text-gray-700">
                  {t('chauffeur.title', { defaultValue: 'Şoför Hizmeti' })} - {formData.duration} {t('chauffeur.hours', { defaultValue: 'saat' })}
                </span>
              </div>
              <div className="text-right">
                {loadingPrice ? (
                  <span className="text-gray-400">...</span>
                ) : baseChauffeurPrice !== null ? (
                  <span className="font-medium text-gray-900">
                    {new Intl.NumberFormat(i18n.language === "tr" ? "tr-TR" : i18n.language === "ar" ? "ar-SA" : "en-US", {
                      style: "currency",
                      currency: "EUR",
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }).format(baseChauffeurPrice)}
                  </span>
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </div>
            </div>

            {/* Add-Ons */}
            {selectedAddOns.length > 0 && selectedAddOns.map((addOn) => {
              const addOnDetails = addOns.find(a => String(a.id) === String(addOn.addOnId));
              if (!addOnDetails) {
                console.warn("Add-on not found:", addOn.addOnId, "Available add-ons:", addOns.map(a => a.id));
                return null;
              }
              return (
                <div key={addOn.addOnId} className="flex justify-between items-center">
                  <div className="flex-1">
                    <span className="text-gray-700">{addOnDetails.name}</span>
                    {addOn.quantity > 1 && (
                      <span className="text-sm text-gray-500 ml-2">(x{addOn.quantity})</span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="font-medium text-gray-900">
                      {new Intl.NumberFormat(i18n.language === "tr" ? "tr-TR" : i18n.language === "ar" ? "ar-SA" : "en-US", {
                        style: "currency",
                        currency: "EUR",
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }).format(addOn.totalPrice)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Total Price */}
          <div className="border-t border-gray-300 pt-4 mt-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-gray-900">{t("booking.totalPrice")}</span>
              {loadingPrice ? (
                <span className="text-secondary text-lg font-bold">{t("booking.calculating", { defaultValue: "Calculating..." })}</span>
              ) : totalPrice !== null ? (
                <span className="text-secondary text-lg font-bold">
                  {new Intl.NumberFormat(i18n.language === "tr" ? "tr-TR" : i18n.language === "ar" ? "ar-SA" : "en-US", {
                    style: "currency",
                    currency: "EUR",
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  }).format(totalPrice)}
                </span>
              ) : (
                <span className="text-red-500 text-lg font-bold">{t("booking.priceError", { defaultValue: "Price unavailable" })}</span>
              )}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex flex-col sm:flex-row justify-end mt-6 space-y-3 sm:space-y-0 sm:space-x-3">
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
        {/* Only show the form if not submitted AND confirmation is not shown */}
        {!formSubmitted && !showConfirmation ? (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-primary">
                {t("chauffeur.booking.title")}
              </h2>
              <button
                onClick={onCancel}
                className="text-gray-500 hover:text-gray-700"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Step indicators */}
            <div className="flex mb-8">
              {[t("chauffeur.booking.tripDetails"), t("chauffeur.booking.contactInfo"), t("chauffeur.booking.reviewConfirm")].map((step, index) => (
                <div key={index} className="flex-1 relative">
                  <div className={`
                    flex flex-col items-center
                    ${currentStep > index + 1 ? 'text-green-600' : currentStep === index + 1 ? 'text-primary' : 'text-gray-400'}
                  `}>
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center mb-2
                      ${currentStep > index + 1
                        ? 'bg-green-100 border-2 border-green-600'
                        : currentStep === index + 1
                        ? 'bg-primary text-white'
                        : 'bg-gray-200'
                      }
                    `}>
                      {currentStep > index + 1 ? (
                        <CheckCircleIcon className="h-6 w-6" />
                      ) : (
                        <span>{index + 1}</span>
                      )}
                    </div>
                    <div className="text-xs text-center">
                      {step}
                    </div>
                  </div>
                  {index < 2 && (
                    <div className={`absolute top-4 left-1/2 w-full h-0.5
                      ${currentStep > index + 1 ? 'bg-green-600' : 'bg-gray-300'}`}
                    />
                  )}
                </div>
              ))}
            </div>

            <form onSubmit={handleSubmit}>
              {/* Step content */}
              {renderStepContent()}

              {/* Navigation buttons */}
              <div className="flex flex-col sm:flex-row justify-between mt-8 pt-4 border-t space-y-3 sm:space-y-0">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="w-full sm:w-auto px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    {t("chauffeur.booking.back")}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onCancel}
                    className="w-full sm:w-auto px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    {t("chauffeur.booking.cancel")}
                  </button>
                )}

                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      nextStep();
                    }}
                    disabled={!isStepComplete()}
                    className={`
                      w-full sm:w-auto px-6 py-2 rounded-md
                      ${isStepComplete()
                        ? 'bg-secondary text-white hover:bg-secondary-dark'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'}
                    `}
                  >
                    {t("chauffeur.booking.continue")}
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="w-full sm:w-auto btn btn-secondary btn-md flex items-center justify-center"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {t('booking.processing')}
                      </>
                    ) : (
                      t('booking.confirmAndPay')
                    )}
                  </button>
                )}
              </div>
            </form>
          </>
        ) : null}
      </div>

      {/* Render the confirmation modal */}
      <ChauffeurBookingConfirmation
        isOpen={showConfirmation}
        onClose={() => {
          setShowConfirmation(false);
          onCancel(); // Close the form completely
        }}
        submitted={true}
        bookingDetails={{
          bookingId: bookingId,
          customerName: formData.firstName + ' ' + formData.lastName,
          serviceName: t("chauffeur.title"),
          date: formData.pickupDate,
          time: formData.pickupTime,
          duration: formData.duration,
          passengers: formData.passengers,
          totalPrice: totalPrice || 0, // Use backend calculated price
          pickupLocation: formData.pickupLocation,
          dropoffLocation: formData.dropoffLocation,
          specialRequests: formData.specialRequests,
          vehicle: vehicle,
          paymentMethod: formData.paymentMethod
        }}
      />
    </>
  );
}
