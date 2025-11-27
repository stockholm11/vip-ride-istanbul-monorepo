import { apiClient } from "../index";
import { PublicVehicle } from "../../types/public/PublicVehicle";

export const getVehicles = () => {
  return apiClient.get<PublicVehicle[]>("/api/public/vehicles");
};


