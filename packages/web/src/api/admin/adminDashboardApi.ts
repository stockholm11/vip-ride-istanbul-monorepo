import { apiClient } from "../index";

export interface OverviewStats {
  totalVehicles: number;
  totalTours: number;
  totalCategories: number;
  totalBookings: number;
}

export type BookingType = "transfer" | "tour";

export interface RecentBooking {
  id: string;
  type: BookingType;
  userFullName: string;
  pickupDatetime: string;
  totalPrice: number;
}

export interface PopularTourStat {
  tourId: number;
  title: string;
  bookingCount: number;
}

export const getOverviewStats = () => {
  return apiClient.get<OverviewStats>("/api/admin/stats/overview");
};

export const getRecentBookings = () => {
  return apiClient.get<RecentBooking[]>("/api/admin/stats/recent-bookings");
};

export const getPopularTours = () => {
  return apiClient.get<PopularTourStat[]>("/api/admin/stats/popular-tours");
};


