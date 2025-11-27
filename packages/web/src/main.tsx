import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./utils/i18n"; // Import i18n configuration
import "./index.css";
import { loadGoogleMapsAPI } from "./utils/loadGoogleMaps";

// Load Google Maps API before rendering the app
loadGoogleMapsAPI()
  .then(() => {
    console.log("Google Maps API loaded, starting app...");
  })
  .catch((error) => {
    console.error("Failed to load Google Maps API:", error);
    // Continue rendering app even if Google Maps fails
    // The autocomplete components will show appropriate error messages
  })
  .finally(() => {
    const rootElement = document.getElementById('root');
    if (!rootElement) throw new Error('Failed to find the root element');

    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-600">Loading...</div>}>
          <App />
        </Suspense>
      </React.StrictMode>,
    );
  });
