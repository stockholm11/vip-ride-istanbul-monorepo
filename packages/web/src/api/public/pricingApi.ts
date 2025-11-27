import { apiClient } from "../index";

export interface CalculateTransferPriceRequest {
  vehicleId: string;
  distanceKm: number;
  roundTrip?: boolean;
}

export interface CalculateTransferPriceResponse {
  vehicleId: string;
  price: number;
  currency: string;
  distanceKm: number;
  roundTrip: boolean;
}

export interface CalculateChauffeurPriceRequest {
  vehicleId: string;
  durationHours: number;
}

export interface CalculateChauffeurPriceResponse {
  vehicleId: string;
  price: number;
  currency: string;
  durationHours: number;
  hourlyRate: number;
}

export const calculateTransferPrice = async (
  data: CalculateTransferPriceRequest
): Promise<CalculateTransferPriceResponse> => {
  return apiClient.post<CalculateTransferPriceResponse>("/api/pricing/transfer", data);
};

export const calculateChauffeurPrice = async (
  data: CalculateChauffeurPriceRequest
): Promise<CalculateChauffeurPriceResponse> => {
  return apiClient.post<CalculateChauffeurPriceResponse>("/api/pricing/chauffeur", data);
};

export interface CalculateTourPriceRequest {
  tourId: string;
  numberOfPersons: number;
}

export interface CalculateTourPriceResponse {
  tourId: string;
  price: number;
  currency: string;
  numberOfPersons: number;
  pricePerPerson: number;
}

export const calculateTourPrice = async (
  data: CalculateTourPriceRequest
): Promise<CalculateTourPriceResponse> => {
  return apiClient.post<CalculateTourPriceResponse>("/api/pricing/tour", data);
};

