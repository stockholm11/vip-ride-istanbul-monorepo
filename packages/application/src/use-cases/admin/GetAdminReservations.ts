import { IReservationRepository } from "@vip-ride/domain/contracts/IReservationRepository";
import { BookingDTO } from "../../dto/BookingDTO";

export class GetAdminReservationsUseCase {
  constructor(private readonly reservationRepository: IReservationRepository) {}

  async execute(): Promise<BookingDTO[]> {
    const reservations = await this.reservationRepository.findAllAdmin();
    return reservations.map((reservation) => ({
      id: reservation.data.id,
      userFullName: reservation.data.userFullName,
      userEmail: reservation.data.userEmail,
      userPhone: reservation.data.userPhone ?? null,
      vehicleId: reservation.data.vehicleId ?? null,
      vehicleName: reservation.data.vehicleName ?? null,
      vehicleSlug: reservation.data.vehicleSlug ?? null,
      tourId: reservation.data.tourId ?? null,
      tourTitle: reservation.data.tourTitle ?? null,
      tourSlug: reservation.data.tourSlug ?? null,
      pickupLocation: reservation.data.pickupLocation ?? null,
      dropoffLocation: reservation.data.dropoffLocation ?? null,
      pickupDatetime: reservation.data.pickupDatetime
        ? reservation.data.pickupDatetime.toISOString()
        : null,
      passengers: reservation.data.passengers,
      totalPrice: reservation.data.totalPrice,
      paymentStatus: reservation.data.paymentStatus,
      reservationType: reservation.data.reservationType ?? null,
      createdAt: reservation.data.createdAt.toISOString(),
      additionalPassengers: reservation.data.additionalPassengers ?? [],
      addOns: reservation.data.addOns?.map(addOn => ({
        addOnId: addOn.addOnId,
        addOnName: addOn.addOnName,
        quantity: addOn.quantity,
        unitPrice: addOn.unitPrice,
        totalPrice: addOn.totalPrice,
      })) ?? [],
    }));
  }
}

