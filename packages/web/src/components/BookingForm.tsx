import { useState, Fragment, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, CalendarIcon, UserGroupIcon, MapPinIcon, ClockIcon } from '@heroicons/react/24/outline';
import { TourType } from './TourCard';
import { createReservation } from '../api/public';
import { chargePayment } from '../api/public/publicPaymentApi';
import { calculateTourPrice } from '../api/public/pricingApi';
import GoogleAutocomplete from './GoogleAutocomplete';

interface BookingFormProps {
  isOpen: boolean;
  onClose: () => void;
  tour: TourType | null;
}

export default function BookingForm({ isOpen, onClose, tour }: BookingFormProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    guests: 1,
    specialRequests: '',
    paymentMethod: 'creditCard',
    // Corporate invoice option
    requiresCorporateInvoice: false,
    // Additional guests
    additionalGuests: [] as {firstName: string; lastName: string}[],
    cardNumber: '',
    cardHolderName: '',
    expiryDate: '',
    cvv: '',
    billingAddress: '',
    billingCity: '',
    billingCountry: '',
    billingZipCode: '',
    pickupLocation: '',
    dropoffLocation: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [isCalculatingPrice, setIsCalculatingPrice] = useState(false);

  // Calculate tour price from backend when guests change
  useEffect(() => {
    if (!tour || !isOpen) return;

    const calculatePrice = async () => {
      setIsCalculatingPrice(true);
      try {
        const tourId = tour.tourId?.toString() || tour.id?.toString() || tour.slug;
        const response = await calculateTourPrice({
          tourId,
          numberOfPersons: formData.guests,
        });
        setTotalPrice(response.price);
      } catch (error) {
        console.error("Error calculating tour price:", error);
        // No fallback - price calculation must come from backend
        setTotalPrice(0);
      } finally {
        setIsCalculatingPrice(false);
      }
    };

    calculatePrice();
  }, [tour, formData.guests, isOpen]);

  if (!tour) return null;

  // Add validation function for date and time
  const isDateTimeValid = (selectedDate: string, selectedTime: string) => {
    const now = new Date();
    const selectedDateTime = new Date(`${selectedDate}T${selectedTime}`);
    
    // Add 1 hour buffer to prevent bookings too close to current time
    const bufferTime = new Date(now.getTime() + 60 * 60 * 1000);
    
    return selectedDateTime >= bufferTime;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Ek misafir alanları için özel handling
    if (name.startsWith('additionalGuest_')) {
      const [_, guestIndex, field] = name.split('_');
      const index = parseInt(guestIndex);
      
      setFormData(prev => ({
        ...prev,
        additionalGuests: prev.additionalGuests.map((guest, i) => 
          i === index ? { ...guest, [field]: value } : guest
        )
      }));
      return;
    }
    
    // Special handling for date and time validation
    if (name === 'date' || name === 'time') {
      const newDate = name === 'date' ? value : formData.date;
      const newTime = name === 'time' ? value : formData.time;
      
      if (newDate && newTime) {
        if (!isDateTimeValid(newDate, newTime)) {
          alert(t('booking.invalidDateTime'));
          return;
        }
      }
    }
    
    // Special handling for expiry date formatting
    if (name === 'expiryDate') {
      const formattedValue = value
        .replace(/\D/g, '')
        .replace(/^(\d{2})/, '$1/')
        .substring(0, 5);
      setFormData(prev => ({ ...prev, [name]: formattedValue }));
      return;
    }
    
    if (name === "guests") {
      setFormData(prev => ({ ...prev, guests: Number(value) }));
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Ek misafir ekleme fonksiyonu
  const addAdditionalGuest = () => {
    setFormData(prev => ({
      ...prev,
      additionalGuests: [...prev.additionalGuests, { firstName: '', lastName: '' }]
    }));
  };

  // Ek misafir silme fonksiyonu
  const removeAdditionalGuest = (index: number) => {
    setFormData(prev => ({
      ...prev,
      additionalGuests: prev.additionalGuests.filter((_, i) => i !== index)
    }));
  };

  const handleNext = () => {
    // Tüm zorunlu alanları kontrol et
    const requiredFields = {
      firstName: t('booking.firstName'),
      lastName: t('booking.lastName'),
      email: t('booking.email'),
      phone: t('booking.phone'),
      date: t('booking.date'),
      time: t('booking.time'),
      guests: t('booking.numberOfGuests'),
      pickupLocation: t('chauffeur.booking.pickupLocation'),
      dropoffLocation: t('chauffeur.booking.dropoffLocation')
    };

    // Boş alanları bul
    const emptyFields = Object.entries(requiredFields)
      .filter(([key]) => !formData[key as keyof typeof formData]);

    // Eğer boş alan varsa uyarı göster
    if (emptyFields.length > 0) {
      alert(t('booking.requiredFields'));
      return;
    }

    // Misafir sayısı validasyonu
    if (formData.guests > 1) {
      const requiredAdditionalGuests = formData.guests - 1;
      const currentAdditionalGuests = formData.additionalGuests.length;
      
      if (currentAdditionalGuests < requiredAdditionalGuests) {
        alert(t("payment.pleaseAddPassengers"));
        return;
      }
      
      // Ek misafir bilgilerinin dolu olup olmadığını kontrol et
      const hasEmptyGuestInfo = formData.additionalGuests.some(
        guest => !guest.firstName.trim() || !guest.lastName.trim()
      );
      
      if (hasEmptyGuestInfo) {
        alert(t("payment.passengerDetailsRequired"));
        return;
      }
    }

    // Tarih ve saat kontrolü
    if (!isDateTimeValid(formData.date, formData.time)) {
      alert(t('booking.invalidDateTime'));
      return;
    }

    setCurrentStep(2);
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!tour) {
      alert(t('booking.tourNotFound'));
      setIsSubmitting(false);
      return;
    }

    try {
      const pickupDatetime =
        formData.date && formData.time ? `${formData.date}T${formData.time}` : new Date().toISOString();
      const fullName =
        `${formData.firstName} ${formData.lastName}`.trim() ||
        formData.firstName ||
        formData.lastName ||
        "Guest";
      
      // Validate required fields
      if (!formData.email || !formData.email.trim()) {
        throw new Error(t('booking.emailRequired', { defaultValue: 'Email is required' }));
      }
      if (!formData.pickupLocation || !formData.pickupLocation.trim()) {
        throw new Error(t('booking.pickupLocationRequired', { defaultValue: 'Pickup location is required' }));
      }
      if (!totalPrice || totalPrice <= 0) {
        throw new Error(t('booking.priceCalculationError', { defaultValue: 'Price calculation failed. Please try again.' }));
      }
      if (!fullName || !fullName.trim()) {
        throw new Error(t('booking.nameRequired', { defaultValue: 'Name is required' }));
      }
      
      // Use calculated totalPrice from state (already calculated from backend)
      // Ensure tourId is properly converted - prefer tourId if available, otherwise convert id from string to number
      let tourIdValue: number | undefined = undefined;
      if (tour.tourId != null && typeof tour.tourId === "number" && !isNaN(tour.tourId)) {
        tourIdValue = tour.tourId;
      } else if (tour.id != null) {
        const parsedId = Number(tour.id);
        if (!isNaN(parsedId) && isFinite(parsedId)) {
          tourIdValue = parsedId;
        }
      }
      const vehicleIdValue = tour.vehicle?.id != null && typeof tour.vehicle.id === "number" ? tour.vehicle.id : undefined;
      
      const reservation = await createReservation({
        type: "tour",
        tourId: tourIdValue,
        vehicleId: vehicleIdValue,
        userFullname: fullName,
        userFullName: fullName,
        userEmail: formData.email.trim(),
        userPhone: formData.phone?.trim(),
        pickupLocation: formData.pickupLocation.trim(),
        dropoffLocation: formData.dropoffLocation.trim(),
        pickupDatetime,
        passengers: formData.guests,
        totalPrice,
        additionalPassengers: formData.additionalGuests,
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
          name: tour?.title || "VIP Ride Tour",
          category1: "Tour",
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
      console.error('Reservation error:', error);
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (error instanceof Error ? error.message : null);
      setSubmissionError(
        message || t('booking.reservationFailed', { defaultValue: 'We could not complete your reservation. Please try again.' })
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Form verilerini sıfırla
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      date: '',
      time: '',
      guests: 1,
      specialRequests: '',
      paymentMethod: 'creditCard',
      // Corporate invoice option
      requiresCorporateInvoice: false,
      // Additional guests
      additionalGuests: [],
      cardNumber: '',
      cardHolderName: '',
      expiryDate: '',
      cvv: '',
      billingAddress: '',
      billingCity: '',
      billingCountry: '',
      billingZipCode: '',
      pickupLocation: '',
      dropoffLocation: ''
    });
    setSubmissionError(null);
    setIsSubmitting(false);
    // Adımı sıfırla
    setCurrentStep(1);
    onClose();
  };

  // Calculate min date (today)
  const today = new Date().toISOString().split('T')[0];

  // If confirmation is showing, render the confirmation component
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
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
                    {t('booking.book')} {tour.title}
                  </Dialog.Title>

                  <button
                    onClick={handleClose}
                    className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-white hover:bg-primary-dark"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="p-6">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {currentStep === 1 ? (
                      <>
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                              {t('booking.date')} *
                            </label>
                            <input
                              type="date"
                              id="date"
                              name="date"
                              value={formData.date}
                              onChange={handleChange}
                              min={today}
                              required
                              className="w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring focus:ring-secondary focus:ring-opacity-50 text-base"
                            />
                          </div>
                          <div>
                            <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
                              {t('booking.time')} *
                            </label>
                            <div className="relative">
                              <select
                                id="time"
                                name="time"
                                value={formData.time}
                                onChange={handleChange}
                                required
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring focus:ring-secondary focus:ring-opacity-50 text-base"
                              >
                                <option value="">{t('booking.selectTime')}</option>
                                {Array.from({ length: 24 }).map((_, i) => (
                                  <option key={i} value={`${i.toString().padStart(2, '0')}:00`}>
                                    {`${i.toString().padStart(2, '0')}:00`}
                                  </option>
                                ))}
                              </select>
                              <ClockIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="pickupLocation" className="block text-sm font-medium text-gray-700 mb-1">
                              {t('chauffeur.booking.pickupLocation')} *
                            </label>
                            <GoogleAutocomplete
                              id="pickupLocation"
                              name="pickupLocation"
                              value={formData.pickupLocation}
                              onChange={(value) => {
                                setFormData((prev) => ({ ...prev, pickupLocation: value }));
                              }}
                              placeholder={t('chauffeur.booking.pickupLocation')}
                              required
                              className="w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring focus:ring-secondary focus:ring-opacity-50 text-base"
                            />
                          </div>
                          <div>
                            <label htmlFor="dropoffLocation" className="block text-sm font-medium text-gray-700 mb-1">
                              {t('chauffeur.booking.dropoffLocation')} *
                            </label>
                            <GoogleAutocomplete
                              id="dropoffLocation"
                              name="dropoffLocation"
                              value={formData.dropoffLocation}
                              onChange={(value) => {
                                setFormData((prev) => ({ ...prev, dropoffLocation: value }));
                              }}
                              placeholder={t('chauffeur.booking.dropoffLocation')}
                              required
                              className="w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring focus:ring-secondary focus:ring-opacity-50 text-base"
                            />
                          </div>
                        </div>

                        <div className="relative">
                          <label htmlFor="guests" className="block text-sm font-medium text-gray-700 mb-1">
                            {t('booking.numberOfGuests')} *
                          </label>
                          <div className="relative">
                            <select
                              id="guests"
                              name="guests"
                              value={formData.guests}
                              onChange={handleChange}
                              className="w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring focus:ring-secondary focus:ring-opacity-50 pr-10"
                              required
                            >
                              {[...Array(tour.capacity)].map((_, i) => (
                                <option key={i + 1} value={i + 1}>
                                  {i + 1} {i === 0 ? t('booking.guest') : t('booking.guests')}
                                </option>
                              ))}
                            </select>
                            <UserGroupIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                          </div>
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
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring focus:ring-secondary focus:ring-opacity-50"
                          ></textarea>
                        </div>

                        {/* Additional Guests Section */}
                        {formData.guests > 1 && (
                          <div className="border-t pt-6 mt-6">
                            <h4 className="text-lg font-semibold mb-4">{t("payment.additionalPassengers")}</h4>
                            <p className="text-sm text-gray-600 mb-4">
                              {t("booking.firstName")} ve {t("booking.lastName")} bilgilerini giriniz.
                            </p>
                            
                            {formData.additionalGuests.map((guest, index) => (
                              <div key={index} className="bg-gray-50 p-4 rounded-lg mb-4">
                                <div className="flex justify-between items-center mb-3">
                                  <h5 className="font-medium text-gray-700">
                                    {t("payment.passengerNumber")} {index + 2}
                                  </h5>
                                  <button
                                    type="button"
                                    onClick={() => removeAdditionalGuest(index)}
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
                                      name={`additionalGuest_${index}_firstName`}
                                      value={guest.firstName}
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
                                      name={`additionalGuest_${index}_lastName`}
                                      value={guest.lastName}
                                      onChange={handleChange}
                                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring focus:ring-secondary focus:ring-opacity-50 text-base"
                                      required
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                            
                            {formData.additionalGuests.length < formData.guests - 1 && (
                              <button
                                type="button"
                                onClick={addAdditionalGuest}
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

                        <div className="bg-gray-50 p-4 rounded-md text-sm text-gray-600">
                          <p>{t('booking.requiredFields')}</p>
                        </div>

                        {submissionError && (
                          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                            {submissionError}
                          </div>
                        )}

                        {submissionError && (
                          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                            {submissionError}
                          </div>
                        )}

                        <div className="flex justify-end mt-6">
                          <button
                            type="button"
                            onClick={handleClose}
                            className="mr-3 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                          >
                            {t('booking.cancel')}
                          </button>
                          <button
                            type="button"
                            onClick={handleNext}
                            className="btn-gold px-6 py-2"
                          >
                            {t('booking.continue')}
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Tour Summary */}
                        <div className="bg-gray-50 p-4 rounded-lg mb-6">
                          <h4 className="font-semibold text-lg text-primary mb-4">{t('booking.bookingSummary')}</h4>

                          <div className="space-y-3">
                            {/* Tour Name */}
                            <div className="flex items-center">
                              <MapPinIcon className="h-5 w-5 text-secondary mr-2" />
                              <span className="font-medium">{tour.title}</span>
                            </div>

                            {/* Date & Time */}
                            <div className="flex items-center">
                              <CalendarIcon className="h-5 w-5 text-secondary mr-2" />
                              <span>{formData.date} - {formData.time}</span>
                            </div>

                            {/* Pickup & Dropoff Locations */}
                            <div className="flex items-center">
                              <MapPinIcon className="h-5 w-5 text-secondary mr-2" />
                              <span>{formData.pickupLocation} - {formData.dropoffLocation}</span>
                            </div>

                            {/* Guests */}
                            <div className="flex items-center">
                              <UserGroupIcon className="h-5 w-5 text-secondary mr-2" />
                              <span>{formData.guests} {formData.guests === 1 ? t('booking.guest') : t('booking.guests')}</span>
                            </div>

                            {/* Duration */}
                            <div className="flex items-center">
                              <ClockIcon className="h-5 w-5 text-secondary mr-2" />
                              <span>{tour.duration}</span>
                            </div>
                          </div>
                        </div>


                        {/* Payment Method */}
                        <div>
                          <h4 className="text-md font-medium text-gray-700 mb-2">{t('transfer.paymentMethod')}</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <label className="flex items-center p-3 rounded-lg border-2 border-secondary bg-secondary/10">
                              <input
                                type="radio"
                                name="paymentMethod"
                                value="creditCard"
                                checked
                                readOnly
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
                          <p className="mt-3 rounded-md bg-blue-50 px-4 py-3 text-sm text-blue-800">
                            {t('payment.redirecting')}
                          </p>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
                              {t('payment.cardNumber')} *
                            </label>
                            <input
                              type="text"
                              id="cardNumber"
                              name="cardNumber"
                              value={formData.cardNumber}
                              onChange={handleChange}
                              required
                              className="w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring focus:ring-secondary focus:ring-opacity-50 text-base"
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
                              value={formData.cardHolderName}
                              onChange={handleChange}
                              placeholder="JOHN DOE"
                              required
                              className="w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring focus:ring-secondary focus:ring-opacity-50 text-base"
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
                                value={formData.expiryDate}
                                onChange={handleChange}
                                placeholder="MM/YY"
                                maxLength={5}
                                required
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring focus:ring-secondary focus:ring-opacity-50 text-base"
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
                                value={formData.cvv}
                                onChange={handleChange}
                                placeholder="123"
                                maxLength={4}
                                required
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring focus:ring-secondary focus:ring-opacity-50 text-base"
                              />
                            </div>
                          </div>
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
                                    billingCity: isChecked ? prev.billingCity : '',
                                    billingCountry: isChecked ? prev.billingCountry : '',
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
                                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring focus:ring-secondary focus:ring-opacity-50 py-2"
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
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring focus:ring-secondary focus:ring-opacity-50 py-2"
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
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring focus:ring-secondary focus:ring-opacity-50 py-2"
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
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring focus:ring-secondary focus:ring-opacity-50 py-2"
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

                        {/* Price Breakdown */}
                        <div className="border-t border-gray-200 pt-6 mt-6">
                          <h4 className="text-lg font-semibold text-gray-900 mb-4">{t('booking.priceBreakdown', { defaultValue: 'Fiyat Detayı' })}</h4>
                          <div className="space-y-3">
                            {/* Tour Service */}
                            <div className="flex justify-between items-center">
                              <div className="flex-1">
                                <span className="text-gray-700">
                                  {tour.title || t('tour.title', { defaultValue: 'Tur' })} x {formData.guests} {formData.guests === 1 ? t('booking.guest', { defaultValue: 'misafir' }) : t('booking.guests', { defaultValue: 'misafir' })}
                                </span>
                              </div>
                              <div className="text-right">
                                {isCalculatingPrice ? (
                                  <span className="text-gray-400">...</span>
                                ) : totalPrice > 0 ? (
                                  <span className="font-medium text-gray-900">
                                    {new Intl.NumberFormat(i18n.language === "tr" ? "tr-TR" : i18n.language === "ar" ? "ar-SA" : "en-US", {
                                      style: "currency",
                                      currency: "EUR",
                                      minimumFractionDigits: 0,
                                      maximumFractionDigits: 0,
                                    }).format(totalPrice)}
                                  </span>
                                ) : (
                                  <span className="text-gray-400">—</span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Total Price */}
                          <div className="border-t border-gray-300 pt-4 mt-4">
                            <div className="flex justify-between items-center">
                              <span className="text-lg font-bold text-gray-900">{t('booking.totalPrice')}</span>
                              {isCalculatingPrice ? (
                                <span className="text-secondary text-lg font-bold">...</span>
                              ) : totalPrice > 0 ? (
                                <span className="text-secondary text-lg font-bold">
                                  {new Intl.NumberFormat(i18n.language === "tr" ? "tr-TR" : i18n.language === "ar" ? "ar-SA" : "en-US", {
                                    style: "currency",
                                    currency: "EUR",
                                    minimumFractionDigits: 0,
                                    maximumFractionDigits: 0,
                                  }).format(totalPrice)}
                                </span>
                              ) : (
                                <span className="text-red-500 text-lg font-bold">{t('booking.priceError', { defaultValue: 'Price unavailable' })}</span>
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
                                handleClose();
                              }
                            }}
                            className="btn btn-outline-primary mr-3"
                          >
                            {t('booking.cancel')}
                          </button>
                          <button
                            type="submit"
                            className="btn btn-secondary btn-md flex items-center justify-center"
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
                      </>
                    )}
                  </form>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
