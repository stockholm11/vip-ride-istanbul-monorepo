import { Request, Response } from "express";
import { GetAdminOverviewStatsUseCase } from "@vip-ride/application/use-cases/admin/GetAdminOverviewStats";
import { GetAdminRecentBookingsUseCase } from "@vip-ride/application/use-cases/admin/GetAdminRecentBookings";
import { GetAdminPopularToursUseCase } from "@vip-ride/application/use-cases/admin/GetAdminPopularTours";

export class AdminDashboardController {
  constructor(
    private readonly getOverviewStats: GetAdminOverviewStatsUseCase,
    private readonly getRecentBookings: GetAdminRecentBookingsUseCase,
    private readonly getPopularTours: GetAdminPopularToursUseCase
  ) {}

  overview = async (_req: Request, res: Response) => {
    const stats = await this.getOverviewStats.execute();
    return res.json(stats);
  };

  recentBookings = async (_req: Request, res: Response) => {
    const bookings = await this.getRecentBookings.execute();
    return res.json(bookings);
  };

  popularTours = async (_req: Request, res: Response) => {
    const tours = await this.getPopularTours.execute();
    return res.json(tours);
  };
}

