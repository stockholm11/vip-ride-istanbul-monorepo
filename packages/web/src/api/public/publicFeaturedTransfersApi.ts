import { apiClient } from "../index";
import { PublicFeaturedTransfer } from "../../types/public/FeaturedTransfer";

export const getPublicFeaturedTransfers = () => {
  return apiClient.get<PublicFeaturedTransfer[]>("/api/public/featured-transfers");
};


