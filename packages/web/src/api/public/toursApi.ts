import { apiClient } from "../index";
import { PublicTour } from "../../types/public/PublicTour";

export const getTours = () => {
  return apiClient.get<PublicTour[]>("/api/public/tours");
};

export const getTourBySlug = (slug: string) => {
  return apiClient.get<PublicTour>(`/api/public/tours/${slug}`);
};


