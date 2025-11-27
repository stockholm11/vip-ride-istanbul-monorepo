import { IReservationRepository } from "@vip-ride/domain/contracts/IReservationRepository";
import { AdminPopularTourStatDTO } from "../../dto/AdminDashboardDTO";

export class GetAdminPopularToursUseCase {
  constructor(private readonly reservationRepository: IReservationRepository) {}

  async execute(limit = 5): Promise<AdminPopularTourStatDTO[]> {
    const bookings = await this.reservationRepository.findAllAdmin();

    const counts = new Map<
      number,
      { tourId: number; title: string; bookingCount: number }
    >();

    bookings.forEach((booking) => {
      const tourId = booking.data.tourId;
      const tourTitle = booking.data.tourTitle;

      if (!tourId || !tourTitle) {
        return;
      }

      const existing = counts.get(tourId);
      if (existing) {
        existing.bookingCount += 1;
      } else {
        counts.set(tourId, {
          tourId,
          title: tourTitle,
          bookingCount: 1,
        });
      }
    });

    return Array.from(counts.values())
      .sort((a, b) => b.bookingCount - a.bookingCount)
      .slice(0, limit);
  }
}

