import { IReservationRepository } from "@vip-ride/domain/contracts/IReservationRepository";
import { AdminRecentBookingDTO } from "../../dto/AdminDashboardDTO";

export class GetAdminRecentBookingsUseCase {
  constructor(private readonly reservationRepository: IReservationRepository) {}

  async execute(limit = 5): Promise<AdminRecentBookingDTO[]> {
    const bookings = await this.reservationRepository.findAllAdmin();

    return bookings
      .sort(
        (a, b) =>
          b.data.createdAt.getTime() - a.data.createdAt.getTime()
      )
      .slice(0, limit)
      .map((booking) => {
        const pickupDate =
          booking.data.pickupDatetime ?? booking.data.createdAt;

        return {
          id: booking.data.id,
          type: booking.data.tourId ? "tour" : "transfer",
          userFullName: booking.data.userFullName,
          pickupDatetime: pickupDate.toISOString(),
          totalPrice: booking.data.totalPrice,
        };
      });
  }
}

