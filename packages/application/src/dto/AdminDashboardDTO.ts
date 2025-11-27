export interface AdminOverviewStatsDTO {
  totalVehicles: number;
  totalTours: number;
  totalCategories: number;
  totalBookings: number;
}

export interface AdminRecentBookingDTO {
  id: string;
  type: "transfer" | "tour";
  userFullName: string;
  pickupDatetime: string;
  totalPrice: number;
}

export interface AdminPopularTourStatDTO {
  tourId: number;
  title: string;
  bookingCount: number;
}

