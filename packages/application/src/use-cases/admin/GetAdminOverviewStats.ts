import { IVehicleRepository } from "@vip-ride/domain/contracts/IVehicleRepository";
import { ITourRepository } from "@vip-ride/domain/contracts/ITourRepository";
import { ITourCategoryRepository } from "@vip-ride/domain/contracts/ITourCategoryRepository";
import { IReservationRepository } from "@vip-ride/domain/contracts/IReservationRepository";
import { AdminOverviewStatsDTO } from "../../dto/AdminDashboardDTO";

interface GetAdminOverviewStatsDeps {
  vehicleRepository: IVehicleRepository;
  tourRepository: ITourRepository;
  tourCategoryRepository: ITourCategoryRepository;
  reservationRepository: IReservationRepository;
}

export class GetAdminOverviewStatsUseCase {
  constructor(private readonly deps: GetAdminOverviewStatsDeps) {}

  async execute(): Promise<AdminOverviewStatsDTO> {
    const [vehicles, tours, categories, reservations] = await Promise.all([
      this.deps.vehicleRepository.findAllAdmin(),
      this.deps.tourRepository.findAllAdmin(),
      this.deps.tourCategoryRepository.findAllAdmin(),
      this.deps.reservationRepository.findAllAdmin(),
    ]);

    return {
      totalVehicles: vehicles.length,
      totalTours: tours.length,
      totalCategories: categories.length,
      totalBookings: reservations.length,
    };
  }
}

