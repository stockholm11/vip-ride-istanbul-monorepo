import { apiClient } from "../index";

export interface GetRouteRequest {
  fromLat: number;
  fromLng: number;
  toLat: number;
  toLng: number;
}

export interface GetRouteResponse {
  distanceKm: number;
  durationMin: number;
  durationInTrafficMin: number;
}

export const getRoute = async (
  params: GetRouteRequest
): Promise<GetRouteResponse> => {
  const queryParams = new URLSearchParams({
    fromLat: params.fromLat.toString(),
    fromLng: params.fromLng.toString(),
    toLat: params.toLat.toString(),
    toLng: params.toLng.toString(),
  });

  // Use longer timeout for route calculation (20 seconds)
  // Backend may need time for Google API + fallback calculation
  return apiClient.get<GetRouteResponse>(`/api/public/maps/route?${queryParams.toString()}`, {
    timeout: 20000, // 20 second timeout
  });
};

