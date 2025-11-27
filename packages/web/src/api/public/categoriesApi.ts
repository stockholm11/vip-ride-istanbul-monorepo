import { apiClient } from "../index";
import { PublicCategory } from "../../types/public/PublicCategory";

export const getCategories = () => {
  return apiClient.get<PublicCategory[]>("/api/public/tour-categories");
};


