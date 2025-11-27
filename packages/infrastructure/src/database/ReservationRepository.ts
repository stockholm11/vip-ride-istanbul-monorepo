import { IReservationRepository } from "@vip-ride/domain/contracts/IReservationRepository";
import { Reservation, AdditionalPassengerProps, ReservationAddOnProps } from "@vip-ride/domain/entities/Reservation";
import { AdminReservation } from "@vip-ride/domain/entities/AdminReservation";
import { ReservationStatus } from "@vip-ride/domain/enums/ReservationStatus";
import { Price } from "@vip-ride/domain/value-objects/Price";
import { pool } from "./connection";
import { RowDataPacket } from "mysql2/promise";

interface BookingRow extends RowDataPacket {
  id: number;
  userFullName: string;
  userEmail: string;
  userPhone: string | null;
  vehicleId: number | null;
  tourId: number | null;
  pickupLocation: string | null;
  dropoffLocation: string | null;
  pickupDatetime: Date | null;
  passengers: number;
  totalPrice: number;
  paymentStatus: ReservationStatus;
  reservationType: string | null;
  createdAt: Date | null;
  vehicleName: string | null;
  vehicleSlug: string | null;
  tourTitle: string | null;
  tourSlug: string | null;
}

interface PassengerRow extends RowDataPacket {
  bookingId: number;
  firstName: string;
  lastName: string;
}

interface AddOnRow extends RowDataPacket {
  bookingId: number;
  addOnId: number;
  addOnName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

const BOOKING_SELECT = `
  SELECT
    b.id,
    b.user_fullname AS userFullName,
    b.user_email AS userEmail,
    b.user_phone AS userPhone,
    b.vehicle_id AS vehicleId,
    b.tour_id AS tourId,
    b.pickup_location AS pickupLocation,
    b.dropoff_location AS dropoffLocation,
    b.pickup_datetime AS pickupDatetime,
    b.passengers,
    b.total_price AS totalPrice,
    b.payment_status AS paymentStatus,
    b.reservation_type AS reservationType,
    b.created_at AS createdAt,
    v.name AS vehicleName,
    v.slug AS vehicleSlug,
    t.title AS tourTitle,
    t.slug AS tourSlug
  FROM bookings b
  LEFT JOIN vehicles v ON v.id = b.vehicle_id
  LEFT JOIN tours t ON t.id = b.tour_id
`;

const DB_STATUS_TO_DOMAIN: Record<string, ReservationStatus> = {
  pending: ReservationStatus.PENDING,
  PENDING: ReservationStatus.PENDING,
  paid: ReservationStatus.PAID,
  PAID: ReservationStatus.PAID,
  success: ReservationStatus.PAID,
  SUCCESS: ReservationStatus.PAID,
  failed: ReservationStatus.FAILED,
  FAILED: ReservationStatus.FAILED,
};

const domainStatusToDb = (status: ReservationStatus): string => {
  switch (status) {
    case ReservationStatus.PAID:
      return "SUCCESS";
    case ReservationStatus.FAILED:
      return "FAILED";
    default:
      return "PENDING";
  }
};

export class ReservationRepository implements IReservationRepository {
  async save(reservation: Reservation): Promise<Reservation> {
    const data = reservation.data;
    const sql = `
      INSERT INTO bookings (
        user_fullname,
        user_email,
        user_phone,
        vehicle_id,
        tour_id,
        pickup_location,
        dropoff_location,
        pickup_datetime,
        passengers,
        total_price,
        payment_status,
        reservation_type
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      data.userFullName,
      data.userEmail,
      data.userPhone ?? null,
      data.vehicleId ? Number(data.vehicleId) : null,
      data.tourId ?? null,
      data.pickupLocation ?? null,
      data.dropoffLocation ?? null,
      data.pickupDatetime ? formatDateTime(data.pickupDatetime) : null,
      data.passengers,
      data.totalPrice.amount,
      domainStatusToDb(data.paymentStatus ?? ReservationStatus.PENDING),
      data.reservationType ?? null,
    ];

    const [result] = await pool.execute(sql, params);
    const insertedId = (result as { insertId: number }).insertId;
    await this.saveAdditionalPassengers(insertedId, data.additionalPassengers ?? []);
    await this.saveAddOns(insertedId, data.addOns ?? []);
    const created = await this.findById(insertedId.toString());
    return created ?? reservation;
  }

  async findById(id: string): Promise<Reservation | null> {
    const [rows] = await pool.execute<BookingRow[]>(
      `${BOOKING_SELECT} WHERE b.id = ? LIMIT 1`,
      [Number(id)]
    );
    const passengersMap = await this.buildAdditionalPassengersMap(rows);
    const addOnsMap = await this.buildAddOnsMap(rows);
    const row = rows[0];
    return row ? this.mapRowToReservation(row, passengersMap.get(row.id) ?? [], addOnsMap.get(row.id) ?? []) : null;
  }

  async findAll(): Promise<Reservation[]> {
    const [rows] = await pool.query<BookingRow[]>(
      `${BOOKING_SELECT} ORDER BY b.created_at DESC`
    );
    const passengersMap = await this.buildAdditionalPassengersMap(rows);
    const addOnsMap = await this.buildAddOnsMap(rows);
    return rows.map((row) =>
      this.mapRowToReservation(row, passengersMap.get(row.id) ?? [], addOnsMap.get(row.id) ?? [])
    );
  }

  async updatePaymentStatus(id: string, status: ReservationStatus): Promise<void> {
    await pool.execute("UPDATE bookings SET payment_status = ? WHERE id = ?", [
      domainStatusToDb(status),
      Number(id),
    ]);
  }

  async findAllAdmin(): Promise<AdminReservation[]> {
    const [rows] = await pool.query<BookingRow[]>(
      `${BOOKING_SELECT} ORDER BY b.created_at DESC`
    );
    const passengersMap = await this.buildAdditionalPassengersMap(rows);
    const addOnsMap = await this.buildAddOnsMap(rows);

    return rows.map((row) =>
      this.mapRowToAdminReservation(row, passengersMap.get(row.id) ?? [], addOnsMap.get(row.id) ?? [])
    );
  }

  private mapRowToReservation(
    row: BookingRow,
    additionalPassengers: AdditionalPassengerProps[],
    addOns: ReservationAddOnProps[]
  ): Reservation {
    return new Reservation({
      id: row.id.toString(),
      userFullName: row.userFullName,
      userEmail: row.userEmail,
      userPhone: row.userPhone,
      vehicleId: row.vehicleId ? row.vehicleId.toString() : null,
      vehicleName: row.vehicleName,
      vehicleSlug: row.vehicleSlug,
      tourId: row.tourId ?? null,
      tourTitle: row.tourTitle,
      tourSlug: row.tourSlug,
      pickupLocation: row.pickupLocation,
      dropoffLocation: row.dropoffLocation,
      pickupDatetime: row.pickupDatetime ? new Date(row.pickupDatetime) : null,
      passengers: row.passengers,
      totalPrice: Price.create(Number(row.totalPrice)),
      paymentStatus: fromDbStatus(row.paymentStatus),
      reservationType: row.reservationType ?? null,
      createdAt: row.createdAt ? new Date(row.createdAt) : new Date(),
      additionalPassengers,
      addOns,
    });
  }

  private mapRowToAdminReservation(
    row: BookingRow,
    additionalPassengers: AdditionalPassengerProps[],
    addOns: ReservationAddOnProps[]
  ): AdminReservation {
    return new AdminReservation({
      id: row.id.toString(),
      userFullName: row.userFullName,
      userEmail: row.userEmail,
      userPhone: row.userPhone,
      vehicleId: row.vehicleId ? row.vehicleId.toString() : null,
      vehicleName: row.vehicleName,
      vehicleSlug: row.vehicleSlug,
      tourId: row.tourId ?? null,
      tourTitle: row.tourTitle,
      tourSlug: row.tourSlug,
      pickupLocation: row.pickupLocation,
      dropoffLocation: row.dropoffLocation,
      pickupDatetime: row.pickupDatetime ? new Date(row.pickupDatetime) : null,
      passengers: row.passengers,
      totalPrice: Number(row.totalPrice),
      paymentStatus: fromDbStatus(row.paymentStatus),
      reservationType: row.reservationType ?? null,
      createdAt: row.createdAt ? new Date(row.createdAt) : new Date(),
      additionalPassengers,
      addOns,
    });
  }

  private async saveAdditionalPassengers(
    bookingId: number,
    passengers: AdditionalPassengerProps[]
  ): Promise<void> {
    if (!passengers.length) {
      return;
    }

    for (const passenger of passengers) {
      await pool.execute(
        `
          INSERT INTO booking_passengers (
            booking_id,
            first_name,
            last_name
          ) VALUES (?, ?, ?)
        `,
        [bookingId, passenger.firstName, passenger.lastName]
      );
    }
  }

  private async buildAdditionalPassengersMap(
    rows: BookingRow[]
  ): Promise<Map<number, AdditionalPassengerProps[]>> {
    const map = new Map<number, AdditionalPassengerProps[]>();
    if (!rows.length) {
      return map;
    }

    const bookingIds = rows.map((row) => row.id);
    const placeholders = bookingIds.map(() => "?").join(", ");

    const [passengerRows] = await pool.query<PassengerRow[]>(
      `
        SELECT
          booking_id AS bookingId,
          first_name AS firstName,
          last_name AS lastName
        FROM booking_passengers
        WHERE booking_id IN (${placeholders})
        ORDER BY id
      `,
      bookingIds
    );

    passengerRows.forEach((row) => {
      const existing = map.get(row.bookingId) ?? [];
      existing.push({
        firstName: row.firstName,
        lastName: row.lastName,
      });
      map.set(row.bookingId, existing);
    });

    return map;
  }

  private async saveAddOns(
    bookingId: number,
    addOns: ReservationAddOnProps[]
  ): Promise<void> {
    if (!addOns.length) {
      return;
    }

    for (const addOn of addOns) {
      await pool.execute(
        `
          INSERT INTO booking_add_ons (
            booking_id,
            add_on_id,
            quantity,
            unit_price,
            total_price
          ) VALUES (?, ?, ?, ?, ?)
        `,
        [
          bookingId,
          Number(addOn.addOnId),
          addOn.quantity,
          addOn.unitPrice,
          addOn.totalPrice,
        ]
      );
    }
  }

  private async buildAddOnsMap(
    rows: BookingRow[]
  ): Promise<Map<number, ReservationAddOnProps[]>> {
    const map = new Map<number, ReservationAddOnProps[]>();
    if (!rows.length) {
      return map;
    }

    const bookingIds = rows.map((row) => row.id);
    const placeholders = bookingIds.map(() => "?").join(", ");

    const [addOnRows] = await pool.query<AddOnRow[]>(
      `
        SELECT
          bao.booking_id AS bookingId,
          bao.add_on_id AS addOnId,
          ao.name AS addOnName,
          bao.quantity,
          bao.unit_price AS unitPrice,
          bao.total_price AS totalPrice
        FROM booking_add_ons bao
        JOIN add_ons ao ON ao.id = bao.add_on_id
        WHERE bao.booking_id IN (${placeholders})
        ORDER BY bao.id
      `,
      bookingIds
    );

    addOnRows.forEach((row) => {
      const existing = map.get(row.bookingId) ?? [];
      existing.push({
        addOnId: row.addOnId.toString(),
        addOnName: row.addOnName,
        quantity: row.quantity,
        unitPrice: Number(row.unitPrice),
        totalPrice: Number(row.totalPrice),
      });
      map.set(row.bookingId, existing);
    });

    return map;
  }
}

function formatDateTime(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  const hours = `${date.getHours()}`.padStart(2, "0");
  const minutes = `${date.getMinutes()}`.padStart(2, "0");
  const seconds = `${date.getSeconds()}`.padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function fromDbStatus(value: string | null): ReservationStatus {
  if (!value) {
    return ReservationStatus.PENDING;
  }
  return DB_STATUS_TO_DOMAIN[value] ?? ReservationStatus.PENDING;
}

