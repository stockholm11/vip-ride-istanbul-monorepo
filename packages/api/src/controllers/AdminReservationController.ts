import { Request, Response } from "express";
import { GetAdminReservationsUseCase } from "@vip-ride/application/use-cases/admin/GetAdminReservations";

type QueryValue = unknown;

const pickFirstString = (value: QueryValue): string | undefined => {
  if (!value) {
    return undefined;
  }
  if (typeof value === "string") {
    return value;
  }
  if (Array.isArray(value)) {
    const first = value[0];
    return typeof first === "string" ? first : undefined;
  }
  return undefined;
};

const toNumber = (value: QueryValue, fallback: number): number => {
  const raw = pickFirstString(value);
  if (!raw) {
    return fallback;
  }
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const toDate = (value: QueryValue): Date | null => {
  const raw = pickFirstString(value);
  if (!raw) {
    return null;
  }
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export class AdminReservationController {
  constructor(private readonly getAdminReservations: GetAdminReservationsUseCase) {}

  list = async (req: Request, res: Response) => {
    const searchParam = pickFirstString(req.query.search);
    const typeParam = pickFirstString(req.query.type);
    const page = toNumber(req.query.page, 1);
    const limit = toNumber(req.query.limit, 10);
    const dateFrom = toDate(req.query.dateFrom);
    const dateTo = toDate(req.query.dateTo);

    const reservations = await this.getAdminReservations.execute();

    const filtered = reservations.filter((reservation) => {
      const matchesSearch =
        !searchParam || searchParam.trim() === ""
          ? true
          : [reservation.userFullName, reservation.userEmail, reservation.userPhone ?? ""]
              .filter(Boolean)
              .some((field) =>
                field!.toLowerCase().includes(searchParam.trim().toLowerCase())
              );

      const matchesType =
        !typeParam
          ? true
          : reservation.reservationType === typeParam ||
            // Fallback for old records without reservationType
            (typeParam === "tour" && Boolean(reservation.tourId) && !reservation.reservationType) ||
            (typeParam === "transfer" && Boolean(reservation.vehicleId) && !reservation.reservationType) ||
            (typeParam === "chauffeur" && reservation.reservationType === "chauffeur");

      const createdAtDate = new Date(reservation.createdAt);
      const matchesFrom = dateFrom ? createdAtDate >= dateFrom : true;
      const matchesTo = dateTo ? createdAtDate <= dateTo : true;

      return matchesSearch && matchesType && matchesFrom && matchesTo;
    });

    const total = filtered.length;
    const start = (page - 1) * limit;
    const data = filtered.slice(start, start + limit);

    return res.json({ data, total });
  };
}

