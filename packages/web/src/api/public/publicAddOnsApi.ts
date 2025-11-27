import { apiClient } from "../index";

export interface PublicAddOn {
  id: string;
  name: string;
  shortDescription?: string | null;
  price: number;
  isActive: boolean;
  displayOrder: number;
}

export const getPublicAddOns = () => {
  return apiClient.get<PublicAddOn[]>("/api/public/add-ons?active=true");
};

