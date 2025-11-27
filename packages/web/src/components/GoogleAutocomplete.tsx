import { useRef, useEffect, useState } from "react";
import usePlacesAutocomplete from "use-places-autocomplete";

interface GoogleAutocompleteProps {
  value: string;
  onChange: (value: string, place?: google.maps.places.PlaceResult | null) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
  id?: string;
  name?: string;
}

// Check if Google Maps API is loaded
const isGoogleMapsLoaded = (): boolean => {
  return typeof window !== "undefined" && 
         typeof (window as any).google !== "undefined" && 
         typeof (window as any).google.maps !== "undefined" &&
         typeof (window as any).google.maps.places !== "undefined";
};

export default function GoogleAutocomplete({
  value,
  onChange,
  placeholder = "Enter location",
  className = "",
  required = false,
  id,
  name,
}: GoogleAutocompleteProps) {
  const [mapsLoaded, setMapsLoaded] = useState(isGoogleMapsLoaded());
  
  // Wait for Google Maps API to load
  useEffect(() => {
    if (mapsLoaded) return;

    // Check immediately
    if (isGoogleMapsLoaded()) {
      setMapsLoaded(true);
      return;
    }

    // Listen for custom event when Google Maps loads
    const handleGoogleMapsLoaded = () => {
      if (isGoogleMapsLoaded()) {
        setMapsLoaded(true);
      }
    };

    window.addEventListener('google-maps-loaded', handleGoogleMapsLoaded);

    // Also poll as fallback
    const checkGoogleMaps = setInterval(() => {
      if (isGoogleMapsLoaded()) {
        setMapsLoaded(true);
        clearInterval(checkGoogleMaps);
      }
    }, 100);

    // Timeout after 10 seconds
    const timeout = setTimeout(() => {
      clearInterval(checkGoogleMaps);
      if (!isGoogleMapsLoaded()) {
        console.error("Google Maps API failed to load. Please check VITE_GOOGLE_PLACES_API_KEY environment variable.");
      }
    }, 10000);

    return () => {
      window.removeEventListener('google-maps-loaded', handleGoogleMapsLoaded);
      clearInterval(checkGoogleMaps);
      clearTimeout(timeout);
    };
  }, [mapsLoaded]);

  // use-places-autocomplete hook
  // The hook automatically waits for Google Maps API to load
  const {
    ready,
    value: autocompleteValue,
    setValue,
    suggestions: { status, data },
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      componentRestrictions: { country: "tr" }, // Restrict to Turkey
    },
    debounce: 300,
    initOnMount: true, // Initialize when component mounts
  });


  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Sync external value with autocomplete value ONLY when external value changes
  // Don't sync when user is typing (autocompleteValue changes)
  const prevValueRef = useRef(value);
  useEffect(() => {
    // Only sync if external value changed (not if autocompleteValue changed)
    if (value !== prevValueRef.current && value !== autocompleteValue) {
      setValue(value, false); // false = don't trigger suggestions
      prevValueRef.current = value;
    }
  }, [value, autocompleteValue, setValue]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    onChange(e.target.value);
  };

  const handleSelect = async (placeId: string, description: string) => {
    setValue(description, false);
    clearSuggestions();

    // Get place details to extract coordinates
    const service = new google.maps.places.PlacesService(
      document.createElement("div")
    );

    service.getDetails(
      {
        placeId,
        fields: ["geometry", "formatted_address", "name"],
      },
      (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place) {
          const lat = place.geometry?.location?.lat();
          const lng = place.geometry?.location?.lng();
          const address = place.formatted_address || place.name || description;

          if (lat && lng) {
            onChange(address, { ...place, lat, lng, description: address } as any);
          } else {
            onChange(description, place);
          }
        } else {
          onChange(description, null);
        }
      }
    );
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        clearSuggestions();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [clearSuggestions]);

  // Disable input only if Google Maps is not loaded
  // Once Google Maps is loaded, enable input even if hook is not ready yet
  // The hook will become ready shortly after Google Maps loads
  // Force enable if Google Maps is loaded (even if hook says not ready)
  const isDisabled = !mapsLoaded;
  
  // Force enable input if Google Maps is loaded (override hook's ready state)
  useEffect(() => {
    if (mapsLoaded && inputRef.current && inputRef.current.disabled) {
      inputRef.current.disabled = false;
    }
  }, [mapsLoaded]);

  return (
    <div className="relative">
      <input
        ref={inputRef}
        id={id}
        name={name}
        type="text"
        value={autocompleteValue}
        onChange={handleInputChange}
        disabled={isDisabled}
        placeholder={isDisabled ? "Google Maps API yükleniyor..." : (ready ? placeholder : "Hazırlanıyor...")}
        required={required}
        className={className}
        autoComplete="off"
      />
      {!mapsLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 bg-opacity-75 rounded-md pointer-events-none z-10">
          <span className="text-xs text-gray-500">Google Maps API yükleniyor...</span>
        </div>
      )}
      {status === "OK" && data.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {data.map((suggestion: { place_id: string; description: string }) => {
            const { place_id, description } = suggestion;
            return (
              <div
                key={place_id}
                onClick={() => handleSelect(place_id, description)}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
              >
                {description}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

