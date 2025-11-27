/**
 * Load Google Maps API script dynamically
 * This ensures the API key is properly injected from environment variables
 */
export function loadGoogleMapsAPI(): Promise<void> {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (typeof window !== 'undefined' && (window as any).google?.maps?.places) {
      console.log('Google Maps API already loaded');
      resolve();
      return;
    }

    // Check if script already exists
    if (document.querySelector('script[src*="maps.googleapis.com"]')) {
      // Wait for it to load
      const checkInterval = setInterval(() => {
        if ((window as any).google?.maps?.places) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);

      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        reject(new Error('Google Maps API failed to load within timeout'));
      }, 10000);
      return;
    }

    // Get API key from environment
    const googlePlacesKey = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;

    if (!googlePlacesKey || googlePlacesKey.trim() === '') {
      const error = new Error('VITE_GOOGLE_PLACES_API_KEY is not set in environment variables');
      console.error(error.message);
      console.error('Please check:');
      console.error('1. packages/web/.env file exists and contains VITE_GOOGLE_PLACES_API_KEY');
      console.error('2. Frontend dev server is restarted after adding the key');
      reject(error);
      return;
    }

    // Global callback for when Google Maps loads
    (window as any).initGoogleMaps = function() {
      console.log('Google Maps API loaded successfully');
      // Dispatch custom event to notify components
      window.dispatchEvent(new Event('google-maps-loaded'));
      resolve();
    };

    const script = document.createElement('script');
    // Add loading=async parameter to prevent Google's warning
    script.src = `https://maps.googleapis.com/maps/api/js?key=${googlePlacesKey}&libraries=places&loading=async&callback=initGoogleMaps`;
    script.async = true;
    script.defer = true;
    script.onerror = function() {
      const error = new Error('Failed to load Google Maps API script');
      console.error(error.message);
      console.error('Make sure:');
      console.error('1. API key is valid');
      console.error('2. Places API is enabled in Google Cloud Console');
      console.error('3. API key restrictions allow your domain');
      reject(error);
    };

    document.head.appendChild(script);
  });
}

