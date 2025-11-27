import { Request, Response } from "express";
import axios from "axios";
import { calculateDistanceKm } from "@vip-ride/application/utils/distance";
import { getCachedRoute, setCachedRoute } from "../utils/redisClient";

interface GoogleDistanceMatrixResponse {
  rows: Array<{
    elements: Array<{
      distance?: { value: number; text: string };
      duration?: { value: number; text: string };
      duration_in_traffic?: { value: number; text: string };
      status: string;
    }>;
  }>;
}

export class MapsController {
  /**
   * Get route distance and ETA from Google Distance Matrix API
   * Uses Redis caching and falls back to Haversine if Google API fails
   */
  getRoute = async (req: Request, res: Response) => {
    try {
      const { fromLat, fromLng, toLat, toLng } = req.query;

      // Validate required parameters
      if (!fromLat || !fromLng || !toLat || !toLng) {
        return res.status(400).json({
          message: "Missing required parameters: fromLat, fromLng, toLat, toLng",
        });
      }

      const fromLatNum = parseFloat(fromLat as string);
      const fromLngNum = parseFloat(fromLng as string);
      const toLatNum = parseFloat(toLat as string);
      const toLngNum = parseFloat(toLng as string);

      // Validate coordinates
      if (
        isNaN(fromLatNum) ||
        isNaN(fromLngNum) ||
        isNaN(toLatNum) ||
        isNaN(toLngNum)
      ) {
        return res.status(400).json({
          message: "Invalid coordinates",
        });
      }

      // Generate cache key
      const cacheKey = `maps:route:${fromLatNum},${fromLngNum}|${toLatNum},${toLngNum}`;

      // Check Redis cache first (Redis is optional - if it fails, continue without cache)
      try {
        const cachedResult = await getCachedRoute(cacheKey);
        if (cachedResult) {
          return res.json(cachedResult);
        }
      } catch (error) {
        // Redis failed, continue without cache (not critical)
      }

      // Try Google Distance Matrix API
      const googleApiKey = process.env.GOOGLE_MAPS_API_KEY;
      let distanceKm: number;
      let durationMin: number;
      let durationInTrafficMin: number;
      let useFallback = false;

      if (googleApiKey) {
        try {
          const googleUrl = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${fromLatNum},${fromLngNum}&destinations=${toLatNum},${toLngNum}&key=${googleApiKey}&departure_time=now&traffic_model=best_guess`;
          
          const response = await axios.get<GoogleDistanceMatrixResponse>(googleUrl, {
            timeout: 5000, // 5 second timeout for Google API (fallback will be faster)
          });
          
          const element = response.data.rows?.[0]?.elements?.[0];
          const status = element?.status;

          // Check for rate-limit and error statuses
          if (
            status === "OVER_QUERY_LIMIT" ||
            status === "REQUEST_DENIED" ||
            status === "UNKNOWN_ERROR" ||
            status === "SERVER_ERROR"
          ) {
            console.warn(`Google API error status: ${status}, using fallback`);
            useFallback = true;
          } else if (
            status === "OK" &&
            element.distance &&
            element.duration
          ) {
            // Extract distance (convert meters to kilometers, round to 1 decimal)
            const distanceMeters = element.distance.value;
            distanceKm = Math.round((distanceMeters / 1000) * 10) / 10;

            // Extract duration (convert seconds to minutes)
            const durationSeconds = element.duration.value;
            durationMin = Math.round(durationSeconds / 60);

            // Extract duration in traffic if available
            if (element.duration_in_traffic) {
              const durationInTrafficSeconds = element.duration_in_traffic.value;
              durationInTrafficMin = Math.round(durationInTrafficSeconds / 60);
            } else {
              durationInTrafficMin = durationMin;
            }

            // Cache successful response (30 days)
            const result = { distanceKm, durationMin, durationInTrafficMin };
            await setCachedRoute(cacheKey, result, 30 * 24 * 60 * 60);

            return res.json(result);
          } else {
            // Other error status, use fallback
            console.warn(`Google API returned status: ${status}, using fallback`);
            useFallback = true;
          }
        } catch (error) {
          // Handle timeout, network errors, etc.
          if (axios.isAxiosError(error)) {
            if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
              console.warn("Google API timeout, using fallback");
            } else {
              console.warn("Google API request failed, using fallback:", error.message);
            }
          } else {
            console.warn("Google API error, using fallback:", error);
          }
          useFallback = true;
        }
      } else {
        // No API key, use fallback
        console.warn("Google Maps API key not configured, using Haversine fallback");
        useFallback = true;
      }

      // Fallback: Use Haversine distance and simple ETA calculation
      if (useFallback) {
        distanceKm = calculateDistanceKm(fromLatNum, fromLngNum, toLatNum, toLngNum);
        
        // ETA fallback: distanceKm / 60 * 60 (assuming 60 km/h average speed)
        durationMin = Math.round((distanceKm / 60) * 60);
        durationInTrafficMin = durationMin;

        const result = { distanceKm, durationMin, durationInTrafficMin };
        
        // Cache fallback result (shorter TTL: 1 day)
        await setCachedRoute(cacheKey, result, 24 * 60 * 60);

        return res.json(result);
      }

      // This should never be reached, but TypeScript requires it
      return res.status(500).json({
        message: "Failed to calculate route",
      });
    } catch (error) {
      console.error("Error calculating route:", error);
      return res.status(500).json({
        message: "Failed to calculate route",
        error: (error as Error).message,
      });
    }
  };
}

