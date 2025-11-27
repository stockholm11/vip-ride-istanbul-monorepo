import { useState, Fragment, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Dialog, Transition } from '@headlessui/react';
import {
  XMarkIcon,
  MapPinIcon,
  CalendarIcon,
  ClockIcon,
  UsersIcon,
  BriefcaseIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { TransferType } from '../types/transfer';
import { TransferFormData, LocationData } from './TransferBookingForm';
import { VehicleWithPrice } from '../types/public/PublicVehicle';
import { createReservation } from '../api/public';
import { chargePayment } from '../api/public/publicPaymentApi';
import { calculateTransferPrice } from '../api/public/pricingApi';
import AddOnsAccordion from './AddOnsAccordion';
import { getPublicAddOns, PublicAddOn } from '../api/public/publicAddOnsApi';

// Support both new LocationData format and legacy string format (for FeaturedTransfers)
type TransferFormDataCompat = TransferFormData | {
  transferType: TransferType;
  fromLocation: string | LocationData | null;
  toLocation: string | LocationData | null;
  date: string;
  time: string;
  passengers: number;
  luggage: number;
  roundTrip: boolean;
  returnDate?: string;
  returnTime?: string;
};

interface TransferBookingConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: VehicleWithPrice | null;
  transferData: TransferFormDataCompat | null;
  locations: {
    fromName: string;
    toName: string;
    distance?: number;
    travelTime?: string;
  } | null;
  featuredPricing?: {
    basePrice: number;
    featuredTransferId?: string;
  } | null;
}

interface PassengerInfo {
  firstName: string;
  lastName: string;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialRequests: string;
  paymentMethod: 'cash' | 'creditCard';
  // Corporate invoice option
  requiresCorporateInvoice: boolean;
  // Additional passengers
  additionalPassengers: PassengerInfo[];
  // Billing information
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

export default function TransferBookingConfirmation({
  isOpen,
  onClose,
  vehicle,
  transferData,
  locations,
  featuredPricing = null,
}: TransferBookingConfirmationProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [grandTotal, setGrandTotal] = useState<number | null>(null);
  const [baseTransferPrice, setBaseTransferPrice] = useState<number | null>(null);
  const [loadingPrice, setLoadingPrice] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialRequests: '',
    paymentMethod: 'creditCard',
    // Corporate invoice option
    requiresCorporateInvoice: false,
    // Additional passengers
    additionalPassengers: [],
    // Billing information
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [selectedAddOns, setSelectedAddOns] = useState<Array<{
    addOnId: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>>([]);
  const [addOns, setAddOns] = useState<PublicAddOn[]>([]);

  // Reset form when modal is reopened
  useEffect(() => {
    if (isOpen) {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        specialRequests: '',
        paymentMethod: 'creditCard',
        requiresCorporateInvoice: false,
        additionalPassengers: [],
        billingAddress: '',
        billingCity: 'Istanbul',
        billingCountry: 'Turkey',
        billingZipCode: '',
        cardNumber: '',
        cardHolderName: '',
        expiryDate: '',
        cvv: ''
      });
      setSelectedAddOns([]);
      setSubmissionError(null);
    }
  }, [isOpen]);

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

    if (isOpen) {
      fetchAddOns();
    }
  }, [isOpen]);

  // Fetch total price from backend (with round trip if needed)
  useEffect(() => {
    const calculatePrice = async () => {
      if (!vehicle || !transferData || !locations) {
        setGrandTotal(null);
        setBaseTransferPrice(null);
        return;
      }

      const addOnsTotal = selectedAddOns.reduce((sum, addOn) => sum + addOn.totalPrice, 0);

      if (featuredPricing?.basePrice != null) {
        setLoadingPrice(false);
        setBaseTransferPrice(featuredPricing.basePrice);
        setGrandTotal(featuredPricing.basePrice + addOnsTotal);
        return;
      }

      if (!locations.distance) {
        setGrandTotal(null);
        setBaseTransferPrice(null);
        return;
      }

      setLoadingPrice(true);
      try {
        const priceResponse = await calculateTransferPrice({
          vehicleId: vehicle.id.toString(),
          distanceKm: locations.distance,
          roundTrip: transferData.roundTrip || false,
        });
        const basePrice = priceResponse.price;
        setBaseTransferPrice(basePrice);
        setGrandTotal(basePrice + addOnsTotal);
      } catch (error) {
        console.error("Error calculating transfer price:", error);
        setGrandTotal(null);
        setBaseTransferPrice(null);
      } finally {
        setLoadingPrice(false);
      }
    };

    if (isOpen) {
      calculatePrice();
    }
  }, [
    featuredPricing,
    isOpen,
    vehicle,
    transferData,
    locations,
    transferData?.roundTrip,
    locations?.distance,
    selectedAddOns,
    vehicle?.id,
  ]);

  if (!vehicle || !transferData || !locations) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (vehicle.passengerCapacity && transferData.passengers > vehicle.passengerCapacity) {
      alert(t("transfer.capacityExceeded", {
        defaultValue: "Passenger count exceeds the selected vehicle's capacity. Please adjust the number of passengers or choose another vehicle."
      }));
      return;
    }

    if (transferData.passengers > 1) {
      const requiredAdditionalPassengers = transferData.passengers - 1;
      const currentAdditionalPassengers = formData.additionalPassengers.length;

      if (currentAdditionalPassengers < requiredAdditionalPassengers) {
        alert(t("payment.pleaseAddPassengers"));
        return;
      }

      const hasEmptyPassengerInfo = formData.additionalPassengers.some(
        (passenger) => !passenger.firstName.trim() || !passenger.lastName.trim()
      );

      if (hasEmptyPassengerInfo) {
        alert(t("payment.passengerDetailsRequired"));
        return;
      }
    }

    setSubmissionError(null);
    setIsSubmitting(true);

    try {
      const pickupLocationName = locations?.fromName || (typeof transferData.fromLocation === 'string' ? transferData.fromLocation : transferData.fromLocation?.description) || null;
      const dropoffLocationName = locations?.toName || (typeof transferData.toLocation === 'string' ? transferData.toLocation : transferData.toLocation?.description) || null;
      const pickupDatetime =
        transferData.date && transferData.time
          ? `${transferData.date}T${transferData.time}`
          : new Date().toISOString();
      const fullName =
        `${formData.firstName} ${formData.lastName}`.trim() ||
        formData.firstName ||
        formData.lastName ||
        "Guest";

      // Validate required fields
      if (!formData.email || !formData.email.trim()) {
        throw new Error(t('booking.emailRequired', { defaultValue: 'Email is required' }));
      }

      if (!grandTotal || grandTotal <= 0) {
        throw new Error(t('transfer.priceError', { defaultValue: 'Price calculation failed. Please try again.' }));
      }

      if (!fullName || !fullName.trim()) {
        throw new Error(t('booking.nameRequired', { defaultValue: 'Name is required' }));
      }

      const reservation = await createReservation({
        type: "transfer",
        vehicleId: vehicle.id,
        userFullname: fullName,
        userFullName: fullName,
        userEmail: formData.email.trim(),
        userPhone: formData.phone?.trim(),
        pickupLocation: pickupLocationName || "",
        dropoffLocation: dropoffLocationName || undefined,
        pickupDatetime,
        passengers: transferData.passengers,
        distanceKm: locations.distance,
        totalPrice: grandTotal, // Use backend calculated price
        reservationType: featuredPricing ? "featured-transfer" : undefined,
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
        gsmNumber: formData.phone || '',
        email: formData.email.trim(),
        identityNumber: "11111111111",
        registrationAddress: formData.billingAddress || pickupLocationName || "Istanbul",
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
        address: formData.billingAddress || pickupLocationName || "Istanbul",
        zipCode: formData.billingZipCode || "34000",
      };

      // Prepare shipping address
      const shippingAddress = {
        contactName: fullName,
        city: formData.billingCity || "Istanbul",
        country: formData.billingCountry || "Turkey",
        address: pickupLocationName || formData.billingAddress || "Istanbul",
        zipCode: formData.billingZipCode || "34000",
      };

      // Prepare basket items
      const basketItems = [
        {
          id: reservation.id.toString(),
          name: vehicle.name || "VIP Ride Transfer",
          category1: "Transfer",
          itemType: "PHYSICAL",
          price: grandTotal.toFixed(2),
        },
      ];

      const chargeResponse = await chargePayment({
        reservationId: reservation.id,
        price: grandTotal,
        paidPrice: grandTotal,
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
      console.error("Reservation error:", error);
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || (error instanceof Error ? error.message : null);
      setSubmissionError(
        message ||
          t("booking.reservationFailed", {
            defaultValue: "We could not complete your reservation. Please try again.",
          })
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format price - ensures safe handling of undefined values
  const formatPrice = (price: number | undefined) => {
    // Default to 0 if undefined for display purposes
    const safePrice = price !== undefined ? price : 0;

    return new Intl.NumberFormat(i18n.language === 'tr' ? 'tr-TR' : i18n.language === 'ar' ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(safePrice);
  };

  // Use grand total from backend (already includes round trip calculation if needed)
  // No frontend calculation - all pricing comes from backend

  return (
    <>
          <Transition.Root show={isOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-50 overflow-y-auto"
          onClose={() => {
            onClose();
          }}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/75" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-lg bg-white text-left align-middle shadow-xl transition-all">
                  <div className="relative bg-primary text-white py-6 px-6">
                    <Dialog.Title as="h3" className="text-xl font-bold">
                      {t('transfer.confirmBooking')}
                    </Dialog.Title>

                    <button
                      onClick={onClose}
                      className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-white hover:bg-primary-dark"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>

                  <div className="p-6">
                  {submissionError && (
                    <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                      {submissionError}
                    </div>
                  )}
                    {/* Transfer and Vehicle Details */}
                    <div className="bg-gray-50 p-4 rounded-lg mb-6">
                      <h4 className="font-semibold text-lg text-primary mb-4">{t('transfer.bookingSummary')}</h4>

                      <div className="space-y-3">
                        {/* Route */}
                        <div className="flex items-center">
                          <MapPinIcon className="h-5 w-5 text-secondary mr-2" />
                          <div className="flex items-center">
                            <span className="font-medium">{locations.fromName}</span>
                            <ArrowRightIcon className="h-4 w-4 mx-2 text-gray-400" />
                            <span className="font-medium">{locations.toName}</span>
                          </div>
                        </div>

                        {/* Distance (if available) */}
                        {locations.distance && (
                          <div className="flex items-center ml-7">
                            <span className="text-gray-600">
                              {t('transfer.estimatedDistance')}: {locations.distance} km
                            </span>
                          </div>
                        )}

                        {/* Travel Time (if available) */}
                        {locations.travelTime && (
                          <div className="flex items-center ml-7">
                            <ClockIcon className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-gray-600">
                              {t('transfer.estimatedTravelTime')}: {locations.travelTime}
                            </span>
                          </div>
                        )}

                        {/* Date & Time */}
                        <div className="flex items-center">
                          <CalendarIcon className="h-5 w-5 text-secondary mr-2" />
                          <span>{transferData.date} - {transferData.time}</span>
                        </div>

                        {/* Return Trip (if applicable) */}
                        {transferData.roundTrip && transferData.returnDate && transferData.returnTime && (
                          <div className="flex items-center">
                            <CalendarIcon className="h-5 w-5 text-secondary mr-2" />
                            <span className="text-gray-600">{t('transfer.returnTrip')}: {transferData.returnDate} - {transferData.returnTime}</span>
                          </div>
                        )}

                        {/* Passengers & Luggage */}
                        <div className="flex items-center">
                          <UsersIcon className="h-5 w-5 text-secondary mr-2" />
                          <span>{transferData.passengers} {t('transfer.passengers')}, {transferData.luggage} {t('transfer.luggage')}</span>
                        </div>

                        {/* Vehicle */}
                        <div className="flex items-center">
                          <BriefcaseIcon className="h-5 w-5 text-secondary mr-2" />
                          <span>
                            {vehicle.name} (
                            {vehicle.types && vehicle.types.includes("chauffeur")
                              ? t("chauffeur.title")
                              : t("transfer.title")}
                            )
                          </span>
                        </div>

                        {/* Transfer Type */}
                        <div className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-secondary mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                          <span className="capitalize">
                            {transferData.transferType === 'airport'
                              ? t('nav.airportTransfer')
                              : transferData.transferType === 'intercity'
                                ? t('transfer.intercity')
                                : t('transfer.cityTransfer')}
                          </span>
                        </div>

                      </div>
                    </div>

                    {/* Booking Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                            {t('booking.firstName')} *
                          </label>
                          <input
                            type="text"
                            id="firstName"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring focus:ring-secondary focus:ring-opacity-50 text-base"
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                            {t('booking.lastName')} *
                          </label>
                          <input
                            type="text"
                            id="lastName"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring focus:ring-secondary focus:ring-opacity-50 text-base"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            {t('booking.email')} *
                          </label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring focus:ring-secondary focus:ring-opacity-50 text-base"
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                            {t('booking.phone')} *
                          </label>
                          <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring focus:ring-secondary focus:ring-opacity-50 text-base"
                            required
                          />
                        </div>
                      </div>

                      {/* Add-Ons Section */}
                      <div className="mb-6">
                        <AddOnsAccordion
                          selectedAddOns={selectedAddOns}
                          onAddOnsChange={setSelectedAddOns}
                        />
                      </div>

                      <div>
                        <label htmlFor="specialRequests" className="block text-sm font-medium text-gray-700 mb-1">
                          {t('booking.specialRequests')}
                        </label>
                        <textarea
                          id="specialRequests"
                          name="specialRequests"
                          rows={3}
                          value={formData.specialRequests}
                          onChange={handleChange}
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring focus:ring-secondary focus:ring-opacity-50 text-base"
                        ></textarea>
                      </div>

                      {/* Additional Passengers Section */}
                      {transferData.passengers > 1 && (
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
                          
                          {formData.additionalPassengers.length < transferData.passengers - 1 && (
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

                      {/* Payment Method */}
                      <div>
                        <h4 className="text-md font-medium text-gray-700 mb-2">{t('transfer.paymentMethod')}</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <label className="flex items-center p-3 rounded-lg border-2 border-secondary bg-secondary/10 cursor-pointer">
                            <input
                              type="radio"
                              name="paymentMethod"
                              value="creditCard"
                              checked={formData.paymentMethod === 'creditCard'}
                              onChange={handleChange}
                              className="h-4 w-4 text-secondary focus:ring-secondary border-gray-300"
                            />
                            <span className="ml-2 text-sm font-medium">{t('transfer.creditCard')}</span>
                          </label>
                          <label className="flex items-center p-3 rounded-lg border-2 border-gray-200 bg-gray-100 cursor-not-allowed">
                            <input
                              type="radio"
                              name="paymentMethod"
                              value="cash"
                              disabled
                              className="h-4 w-4 text-secondary border-gray-300"
                            />
                            <span className="ml-2 text-sm font-medium text-gray-500">{t('transfer.cash')}</span>
                          </label>
                        </div>
                        {formData.paymentMethod === 'creditCard' && (
                          <div className="mt-4 space-y-4">
                            <div>
                              <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
                                {t('payment.cardNumber')} *
                              </label>
                              <input
                                type="text"
                                id="cardNumber"
                                name="cardNumber"
                                value={formData.cardNumber || ''}
                                onChange={handleChange}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring focus:ring-secondary focus:ring-opacity-50 text-base"
                                placeholder="1234 5678 9012 3456"
                                maxLength={19}
                                required
                              />
                            </div>

                            <div>
                              <label htmlFor="cardHolderName" className="block text-sm font-medium text-gray-700 mb-1">
                                {t('payment.cardholderName')} *
                              </label>
                              <input
                                type="text"
                                id="cardHolderName"
                                name="cardHolderName"
                                value={formData.cardHolderName || ''}
                                onChange={handleChange}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring focus:ring-secondary focus:ring-opacity-50 text-base"
                                placeholder="JOHN DOE"
                                required
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">
                                  {t('payment.expiryDate')} *
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
                                  required
                                />
                              </div>

                              <div>
                                <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">
                                  {t('payment.cvv')} *
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
                                  required
                                />
                              </div>
                            </div>
                          </div>
                        )}
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
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="bg-gray-50 p-4 rounded-md text-sm text-gray-600">
                        <p>{t('booking.requiredFields')}</p>
                      </div>

                      {/* Price Breakdown */}
                      <div className="border-t border-gray-200 pt-6 mt-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">{t('transfer.priceBreakdown', { defaultValue: 'Fiyat Detayı' })}</h4>
                        <div className="space-y-3">
                          {/* Transfer Service */}
                          <div className="flex justify-between items-center">
                            <div className="flex-1">
                              <span className="text-gray-700">
                                {transferData.roundTrip 
                                  ? t('transfer.roundTrip', { defaultValue: 'Gidiş-Dönüş' })
                                  : t('transfer.oneWay', { defaultValue: 'Tek Yön' })}
                              </span>
                              {transferData.roundTrip && (
                                <span className="text-sm text-gray-500 ml-2">(x2)</span>
                              )}
                            </div>
                            <div className="text-right">
                              {loadingPrice ? (
                                <span className="text-gray-400">...</span>
                              ) : baseTransferPrice !== null ? (
                                <span className="font-medium text-gray-900">
                                  {formatPrice(baseTransferPrice)}
                                </span>
                              ) : (
                                <span className="text-gray-400">—</span>
                              )}
                            </div>
                          </div>

                          {/* Add-Ons */}
                          {selectedAddOns.length > 0 && selectedAddOns.map((addOn) => {
                            const addOnDetails = addOns.find(a => a.id === addOn.addOnId);
                            if (!addOnDetails) return null;
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
                                    {formatPrice(addOn.totalPrice)}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Total Price */}
                        <div className="border-t border-gray-300 pt-4 mt-4">
                          <div className="flex justify-between items-center">
                            <span className="text-lg font-bold text-gray-900">{t('transfer.totalPrice')}</span>
                            {loadingPrice ? (
                              <span className="text-secondary text-lg font-bold">...</span>
                            ) : grandTotal !== null ? (
                              <span className="text-secondary text-lg font-bold">{formatPrice(grandTotal)}</span>
                            ) : (
                              <span className="text-red-500 text-lg font-bold">{t('transfer.priceError', { defaultValue: 'Price unavailable' })}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end mt-6">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            if (window.confirm(t('booking.confirmCancel'))) {
                              onClose();
                            }
                          }}
                          className="btn btn-outline-primary mr-3 min-h-[44px]"
                        >
                          {t('booking.cancel')}
                        </button>
                        <button
                          type="submit"
                          className="btn btn-secondary btn-md flex items-center justify-center min-h-[44px]"
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
                            t('transfer.confirmAndPay')
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>

    </>
  );
}
