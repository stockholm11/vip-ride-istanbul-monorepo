import { useState, useEffect, Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, Transition } from '@headlessui/react';
import {
  MapPinIcon,
  CalendarIcon,
  ClockIcon,
  UsersIcon,
  BriefcaseIcon
} from '@heroicons/react/24/outline';
import { TransferType } from '../types/transfer';
import { useIsMobile } from '../hooks/useMediaQuery';
import GoogleAutocomplete from './GoogleAutocomplete';

interface TransferBookingFormProps {
  onSearch: (formData: TransferFormData) => void;
  initialTransferType?: TransferType;
  onRoundTripChange?: (roundTrip: boolean) => void;
}

export interface LocationData {
  lat: number;
  lng: number;
  description: string;
}

export interface TransferFormData {
  transferType: TransferType;
  fromLocation: LocationData | null;
  toLocation: LocationData | null;
  date: string;
  time: string;
  passengers: number;
  luggage: number;
  roundTrip: boolean;
  returnDate?: string;
  returnTime?: string;
  direction?: 'fromAirport' | 'toDestination';
}


export default function TransferBookingForm({ onSearch, initialTransferType = 'airport', onRoundTripChange }: TransferBookingFormProps) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [formData, setFormData] = useState<TransferFormData>({
    transferType: initialTransferType,
    fromLocation: null,
    toLocation: null,
    date: '',
    time: '',
    passengers: 1,
    luggage: 1,
    roundTrip: false,
    returnDate: '',
    returnTime: '',
    direction: 'fromAirport',
  });

  // Calculate min date (today)
  const today = new Date().toISOString().split('T')[0];

  // Add validation function for date and time
  const isDateTimeValid = (selectedDate: string, selectedTime: string) => {
    const now = new Date();
    const selectedDateTime = new Date(`${selectedDate}T${selectedTime}`);
    
    // Add 1 hour buffer to prevent bookings too close to current time
    const bufferTime = new Date(now.getTime() + 60 * 60 * 1000);
    
    return selectedDateTime >= bufferTime;
  };

  const handleLocationChange = (field: 'fromLocation' | 'toLocation', value: string, place?: google.maps.places.PlaceResult | null) => {
    if (place && (place as any).lat && (place as any).lng) {
      // Place selected with coordinates
      setFormData((prev) => ({
        ...prev,
        [field]: {
          lat: (place as any).lat,
          lng: (place as any).lng,
          description: value,
        },
      }));
    } else if (place?.geometry?.location) {
      // Place selected with geometry
      const location = place.geometry.location;
      if (location) {
        setFormData((prev) => ({
          ...prev,
          [field]: {
            lat: location.lat(),
            lng: location.lng(),
            description: value,
          },
        }));
      }
    } else if (value.trim() !== '') {
      // User is typing - update description but keep existing coordinates if available
      setFormData((prev) => {
        const currentLocation = prev[field];
        if (currentLocation) {
          // Keep existing coordinates, update description
          return {
            ...prev,
            [field]: {
              ...currentLocation,
              description: value,
            },
          };
        } else {
          // No existing location, just store description (coordinates will be set when place is selected)
          return {
            ...prev,
            [field]: {
              lat: 0,
              lng: 0,
              description: value,
            },
          };
        }
      });
    } else {
      // Empty value - clear the location
      setFormData((prev) => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLButtonElement>) => {
    const { name, value, type } = e.target;

    // Special handling for date and time validation
    if (name === 'date' || name === 'time' || name === 'returnDate' || name === 'returnTime') {
      const newDate = name === 'date' ? value : formData.date;
      const newTime = name === 'time' ? value : formData.time;
      
      if (newDate && newTime) {
        if (!isDateTimeValid(newDate, newTime)) {
          alert(t('booking.invalidDateTime'));
          return;
        }
      }

      // For return trip validation
      if (name === 'returnDate' || name === 'returnTime') {
        const newReturnDate = name === 'returnDate' ? value : formData.returnDate;
        const newReturnTime = name === 'returnTime' ? value : formData.returnTime;
        
        if (newReturnDate && newReturnTime) {
          if (!isDateTimeValid(newReturnDate, newReturnTime)) {
            alert(t('booking.invalidDateTime'));
            return;
          }

          // Check if return date is after departure date
          const departureDateTime = new Date(`${formData.date}T${formData.time}`);
          const returnDateTime = new Date(`${newReturnDate}T${newReturnTime}`);
          
          if (returnDateTime <= departureDateTime) {
            alert(t('booking.returnDateAfterDeparture'));
            return;
          }
        }
      }
    }

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => {
        const newData = {
          ...prev,
          [name]: checked,
        };
        // If roundTrip changed, notify parent
        if (name === 'roundTrip' && onRoundTripChange) {
          onRoundTripChange(checked);
        }
        return newData;
      });
      return;
    }

    if (name === "passengers" || name === "luggage") {
      setFormData((prev) => ({
        ...prev,
        [name]: Number(value),
      }));
      return;
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(formData);
  };


  // Form verilerini sıfırlama fonksiyonu
  const resetForm = () => {
    setFormData({
      transferType: initialTransferType,
      fromLocation: null,
      toLocation: null,
      date: '',
      time: '',
      passengers: 1,
      luggage: 1,
      roundTrip: false,
      returnDate: '',
      returnTime: '',
      direction: 'fromAirport',
    });
  };

  // Form kapatıldığında verileri sıfırla
  useEffect(() => {
    return () => {
      resetForm();
    };
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 md:p-6">
      <h3 className="text-lg font-bold text-primary mb-4">{t("transfer.bookTransfer")}</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Transfer Type Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            key="airport"
            type="button"
            onClick={() => handleChange({ target: { name: 'transferType', value: 'airport' } } as React.ChangeEvent<HTMLButtonElement>)}
            className={`flex items-center justify-center p-3 rounded-lg border ${
              formData.transferType === 'airport'
                ? "border-secondary bg-secondary/10 text-secondary"
                : "border-gray-200 hover:border-secondary/50"
            }`}
          >
            {t('nav.airportTransfer')}
          </button>

          <button
            key="intercity"
            type="button"
            onClick={() => handleChange({ target: { name: 'transferType', value: 'intercity' } } as React.ChangeEvent<HTMLButtonElement>)}
            className={`flex items-center justify-center p-3 rounded-lg border ${
              formData.transferType === 'intercity'
                ? "border-secondary bg-secondary/10 text-secondary"
                : "border-gray-200 hover:border-secondary/50"
            }`}
          >
            {t('transfer.intercity')}
          </button>

          <button
            key="city"
            type="button"
            onClick={() => handleChange({ target: { name: 'transferType', value: 'city' } } as React.ChangeEvent<HTMLButtonElement>)}
            className={`flex items-center justify-center p-3 rounded-lg border ${
              formData.transferType === 'city'
                ? "border-secondary bg-secondary/10 text-secondary"
                : "border-gray-200 hover:border-secondary/50"
            }`}
          >
            {t('transfer.cityTransfer')}
          </button>
        </div>

        {/* Location Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <label htmlFor="fromLocation" className="block text-sm font-medium text-gray-700 mb-1">
              {t('transfer.fromLocation')}
            </label>
            <div className="relative">
              <GoogleAutocomplete
                id="fromLocation"
                name="fromLocation"
                value={formData.fromLocation?.description || ''}
                onChange={(value, place) => handleLocationChange('fromLocation', value, place)}
                placeholder={t('transfer.selectLocation')}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring focus:ring-secondary focus:ring-opacity-50 pl-10 py-2 md:py-3 text-base"
                required
              />
              <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="relative">
            <label htmlFor="toLocation" className="block text-sm font-medium text-gray-700 mb-1">
              {t('transfer.toLocation')}
            </label>
            <div className="relative">
              <GoogleAutocomplete
                id="toLocation"
                name="toLocation"
                value={formData.toLocation?.description || ''}
                onChange={(value, place) => handleLocationChange('toLocation', value, place)}
                placeholder={t('transfer.selectLocation')}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring focus:ring-secondary focus:ring-opacity-50 pl-10 py-2 md:py-3 text-base"
                required
              />
              <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Date and Time Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
              {t('transfer.date')}
            </label>
            <div className="relative">
              <input
                type="date"
                id="date"
                name="date"
                min={today}
                value={formData.date}
                onChange={handleChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring focus:ring-secondary focus:ring-opacity-50 pl-10 py-2 md:py-3 text-base"
                required
              />
              <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          </div>

          <div className="relative">
            <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
              {t('transfer.time')}
            </label>
            <div className="relative">
              <select
                id="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring focus:ring-secondary focus:ring-opacity-50 pl-10 py-2 md:py-3 text-base"
                required
              >
                <option value="">{t('booking.selectTime')}</option>
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

        {/* Passengers and Luggage */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <label htmlFor="passengers" className="block text-sm font-medium text-gray-700 mb-1">
              {t('transfer.passengers')}
            </label>
            <div className="relative">
              <select
                id="passengers"
                name="passengers"
                value={formData.passengers}
                onChange={handleChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring focus:ring-secondary focus:ring-opacity-50 pl-10 py-2 md:py-3 text-base"
                required
              >
                {Array.from({ length: 16 }).map((_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1}</option>
                ))}
              </select>
              <UsersIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          </div>

          <div className="relative">
            <label htmlFor="luggage" className="block text-sm font-medium text-gray-700 mb-1">
              {t('transfer.luggage')}
            </label>
            <div className="relative">
              <select
                id="luggage"
                name="luggage"
                value={formData.luggage}
                onChange={handleChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring focus:ring-secondary focus:ring-opacity-50 pl-10 py-2 md:py-3 text-base"
                required
              >
                {Array.from({ length: 10 }).map((_, i) => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>
              <BriefcaseIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Round Trip Option */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="roundTrip"
            name="roundTrip"
            checked={formData.roundTrip}
            onChange={handleChange}
            className="h-5 w-5 text-secondary focus:ring-secondary border-gray-300 rounded"
          />
          <label htmlFor="roundTrip" className="ml-2 block text-sm text-gray-700">
            {t('transfer.roundTrip')}
          </label>
        </div>

        {/* Return Date and Time (if round trip) */}
        {formData.roundTrip && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <label htmlFor="returnDate" className="block text-sm font-medium text-gray-700 mb-1">
                {t('transfer.returnDate')}
              </label>
              <div className="relative">
                <input
                  type="date"
                  id="returnDate"
                  name="returnDate"
                  min={formData.date || today}
                  value={formData.returnDate || ''}
                  onChange={handleChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring focus:ring-secondary focus:ring-opacity-50 pl-10 py-2 md:py-3 text-base"
                  required={formData.roundTrip}
                />
                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div className="relative">
              <label htmlFor="returnTime" className="block text-sm font-medium text-gray-700 mb-1">
                {t('transfer.returnTime')}
              </label>
              <div className="relative">
                <select
                  id="returnTime"
                  name="returnTime"
                  value={formData.returnTime || ''}
                  onChange={handleChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring focus:ring-secondary focus:ring-opacity-50 pl-10 py-2 md:py-3 text-base"
                  required={formData.roundTrip}
                >
                  <option value="">{t('booking.selectTime')}</option>
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
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-3 bg-secondary text-white font-semibold rounded-md hover:bg-secondary-dark transition-colors"
        >
          {t('transfer.searchVehicles')}
        </button>
      </form>
    </div>
  );
}
