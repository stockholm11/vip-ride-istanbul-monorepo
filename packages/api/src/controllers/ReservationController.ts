import { Request, Response } from "express";
import { CreateReservationUseCase } from "@vip-ride/application/use-cases/booking/CreateReservation";
import { SendBookingEmailUseCase } from "@vip-ride/application/use-cases/notification/SendBookingEmail";
import { ProcessPaymentUseCase } from "@vip-ride/application/use-cases/booking/ProcessPayment";
import { CreateReservationDTO } from "@vip-ride/application/dto/ReservationDTO";
import { GetReservationsUseCase } from "@vip-ride/application/use-cases/booking/GetReservations";

interface ReservationControllerDeps {
  createReservationUseCase: CreateReservationUseCase;
  getReservationsUseCase: GetReservationsUseCase;
  sendBookingEmailUseCase?: SendBookingEmailUseCase;
  processPaymentUseCase?: ProcessPaymentUseCase;
}

export function createReservationController({
  createReservationUseCase,
  getReservationsUseCase,
  sendBookingEmailUseCase,
  processPaymentUseCase,
}: ReservationControllerDeps) {
  return {
    list: async (_req: Request, res: Response) => {
      const reservations = await getReservationsUseCase.execute();
      return res.json(reservations);
    },
    create: async (req: Request, res: Response) => {
      try {
        // Skip processPaymentUseCase for now - it's causing issues
        // if (processPaymentUseCase) {
        //   await processPaymentUseCase.execute(req.body.paymentRequest ?? {});
        // }

        const payload = mapCreateReservationPayload(req.body);
        const reservation = await createReservationUseCase.execute(payload);

        // Email will be sent after successful payment in PaymentController

        res.status(201).json(reservation);
      } catch (error) {
        console.error("[ReservationController] Error creating reservation:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        const errorStack = error instanceof Error ? error.stack : undefined;
        res.status(400).json({ 
          message: errorMessage,
          ...(process.env.NODE_ENV === 'development' && { stack: errorStack })
        });
      }
    },
  };
}

type AdditionalPassenger = { firstName: string; lastName: string };

function normalizeAdditionalPassengers(value: any): AdditionalPassenger[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (!item) {
        return null;
      }

      const firstName = typeof item.firstName === "string" ? item.firstName.trim() : "";
      const lastName = typeof item.lastName === "string" ? item.lastName.trim() : "";

      if (!firstName || !lastName) {
        return null;
      }

      return { firstName, lastName };
    })
    .filter((item): item is AdditionalPassenger => Boolean(item));
}

function mapCreateReservationPayload(body: any): CreateReservationDTO {
  try {
    const firstName = body.firstName ?? "";
    const lastName = body.lastName ?? "";
    const fallbackName = [firstName, lastName].filter(Boolean).join(" ").trim();

    const derivedName = fallbackName || body.name || "Guest";

    // Convert vehicleId and tourId to number if they are strings
    const vehicleId = body.vehicleId ?? body.vehicle_id;
    const tourId = body.tourId ?? body.tour_id;

    // Helper to convert empty strings to undefined (DTO expects undefined, not null)
    const toUndefinedIfEmpty = (value: any): string | undefined => {
      if (value == null) return undefined;
      const str = String(value).trim();
      return str === "" ? undefined : str;
    };

    const userEmail = toUndefinedIfEmpty(body.userEmail ?? body.customerEmail ?? body.email);
    if (!userEmail) {
      throw new Error("Email is required");
    }

    const passengers = Number(body.passengers ?? body.guests ?? 1);
    const totalPrice = Number(body.totalPrice ?? body.total_price ?? body.price ?? 0);

    if (!Number.isFinite(passengers) || passengers <= 0) {
      throw new Error(`Invalid passengers count: ${passengers}`);
    }

    if (!Number.isFinite(totalPrice) || totalPrice < 0) {
      throw new Error(`Invalid total price: ${totalPrice}`);
    }

    const additionalPassengers =
      normalizeAdditionalPassengers(body.additionalPassengers ?? body.additionalGuests);

    // Normalize add-ons
    const normalizeAddOns = (value: any): Array<{ addOnId: string; quantity: number }> => {
      if (!Array.isArray(value)) {
        return [];
      }

      return value
        .map((item) => {
          if (!item) {
            return null;
          }

          const addOnId = item.addOnId ? String(item.addOnId).trim() : "";
          const quantity = Number(item.quantity ?? 0);

          if (!addOnId || !Number.isFinite(quantity) || quantity <= 0) {
            return null;
          }

          return { addOnId, quantity };
        })
        .filter((item): item is { addOnId: string; quantity: number } => Boolean(item));
    };

    const addOns = normalizeAddOns(body.addOns);

    return {
      userFullName:
        body.userFullName ??
        body.customerName ??
        derivedName,
      userEmail,
      userPhone: toUndefinedIfEmpty(body.userPhone ?? body.customerPhone ?? body.phone),
      vehicleId: vehicleId != null ? (typeof vehicleId === "string" ? Number(vehicleId) : vehicleId) : null,
      tourId: tourId != null ? (typeof tourId === "string" ? Number(tourId) : tourId) : null,
      pickupLocation: toUndefinedIfEmpty(body.pickupLocation ?? body.pickup_location),
      dropoffLocation: toUndefinedIfEmpty(body.dropoffLocation ?? body.dropoff_location),
      pickupDate: body.pickupDate ?? body.date,
      pickupTime: body.pickupTime ?? body.time,
      pickupDatetime: body.pickupDatetime ?? body.pickup_datetime,
      passengers,
      totalPrice,
      reservationType: body.type ?? body.reservationType ?? null,
      additionalPassengers,
      addOns,
    };
  } catch (error) {
    console.error("[mapCreateReservationPayload] Error:", error);
    throw error;
  }
}

