import { Reservation, AdditionalPassengerProps, ReservationAddOnProps } from "@vip-ride/domain/entities/Reservation";
import { Price } from "@vip-ride/domain/value-objects/Price";
import { IReservationRepository } from "@vip-ride/domain/contracts/IReservationRepository";
import { IAddOnRepository } from "@vip-ride/domain/contracts/IAddOnRepository";
import { CreateReservationDTO, AdditionalPassengerDTO, ReservationAddOnDTO } from "../../dto/ReservationDTO";
import { BookingDTO } from "../../dto/BookingDTO";

export class CreateReservationUseCase {
  constructor(
    private readonly reservationRepository: IReservationRepository,
    private readonly addOnRepository: IAddOnRepository
  ) {}

  async execute(input: CreateReservationDTO): Promise<BookingDTO> {
    try {
      const totalPriceAmount = Number.isFinite(input.totalPrice)
        ? input.totalPrice
        : 0;
      const passengers = Number.isFinite(input.passengers)
        ? Math.max(1, input.passengers)
        : 1;

      if (!input.userFullName || !input.userFullName.trim()) {
        throw new Error("User full name is required");
      }

      if (!input.userEmail || !input.userEmail.trim()) {
        throw new Error("User email is required");
      }

      if (totalPriceAmount < 0) {
        throw new Error(`Price cannot be negative: ${totalPriceAmount}`);
      }

      if (passengers <= 0) {
        throw new Error(`Passengers must be positive: ${passengers}`);
      }

      const additionalPassengers = this.normalizeAdditionalPassengers(
        input.additionalPassengers,
        passengers
      );

      // Process add-ons and calculate their total price
      const addOns = await this.processAddOns(input.addOns ?? []);
      const addOnsTotalPrice = addOns.reduce((sum, addOn) => sum + addOn.totalPrice, 0);
      const finalTotalPrice = totalPriceAmount + addOnsTotalPrice;

      const reservation = new Reservation({
        userFullName: input.userFullName,
        userEmail: input.userEmail,
        userPhone: input.userPhone ?? null,
        vehicleId: input.vehicleId ?? null,
        tourId: input.tourId ?? null,
        pickupLocation: input.pickupLocation ?? null,
        dropoffLocation: input.dropoffLocation ?? null,
        pickupDatetime: this.resolvePickupDatetime(input),
        passengers,
        totalPrice: Price.create(finalTotalPrice),
        reservationType: input.reservationType ?? null,
        additionalPassengers,
        addOns,
      });

      const saved = await this.reservationRepository.save(reservation);
      const data = saved.data;

      return {
        id: data.id,
        userFullName: data.userFullName,
        userEmail: data.userEmail,
        userPhone: data.userPhone ?? null,
        vehicleId: data.vehicleId ?? null,
        vehicleName: data.vehicleName ?? null,
        vehicleSlug: data.vehicleSlug ?? null,
        tourId: data.tourId ?? null,
        tourTitle: data.tourTitle ?? null,
        tourSlug: data.tourSlug ?? null,
        pickupLocation: data.pickupLocation ?? null,
        dropoffLocation: data.dropoffLocation ?? null,
        pickupDatetime: data.pickupDatetime
          ? data.pickupDatetime.toISOString()
          : null,
        passengers: data.passengers,
        totalPrice: data.totalPrice.amount,
        paymentStatus: data.paymentStatus,
        reservationType: data.reservationType ?? null,
        createdAt: data.createdAt.toISOString(),
        additionalPassengers: data.additionalPassengers ?? [],
        addOns: data.addOns?.map(addOn => ({
          addOnId: addOn.addOnId,
          addOnName: addOn.addOnName,
          quantity: addOn.quantity,
          unitPrice: addOn.unitPrice,
          totalPrice: addOn.totalPrice,
        })) ?? [],
      };
    } catch (error) {
      throw error;
    }
  }

  private async processAddOns(
    addOnsInput: ReservationAddOnDTO[]
  ): Promise<ReservationAddOnProps[]> {
    if (!addOnsInput || addOnsInput.length === 0) {
      return [];
    }

    const processedAddOns: ReservationAddOnProps[] = [];

    for (const addOnInput of addOnsInput) {
      if (!addOnInput.addOnId || addOnInput.quantity <= 0) {
        continue;
      }

      const addOn = await this.addOnRepository.findById(addOnInput.addOnId);
      if (!addOn || !addOn.isActive) {
        continue;
      }

      const unitPrice = addOn.price;
      const totalPrice = unitPrice * addOnInput.quantity;

      processedAddOns.push({
        addOnId: addOn.id,
        addOnName: addOn.name,
        quantity: addOnInput.quantity,
        unitPrice,
        totalPrice,
      });
    }

    return processedAddOns;
  }

  private resolvePickupDatetime(input: CreateReservationDTO): Date | null {
    if (input.pickupDatetime) {
      return new Date(input.pickupDatetime);
    }

    if (input.pickupDate) {
      const base = input.pickupDate;
      const time = input.pickupTime ?? "00:00";
      return new Date(`${base}T${time}`);
    }

    return null;
  }

  private normalizeAdditionalPassengers(
    passengersInput: AdditionalPassengerDTO[] | undefined,
    totalPassengers: number
  ): AdditionalPassengerProps[] {
    if (!passengersInput || passengersInput.length === 0 || totalPassengers <= 1) {
      return [];
    }

    const normalized = passengersInput
      .map((passenger) => ({
        firstName: passenger.firstName?.trim() ?? "",
        lastName: passenger.lastName?.trim() ?? "",
      }))
      .filter((passenger) => passenger.firstName && passenger.lastName);

    const required = Math.max(0, totalPassengers - 1);

    if (normalized.length !== required) {
      throw new Error(`Please provide details for ${required} additional passenger(s).`);
    }

    return normalized;
  }
}

