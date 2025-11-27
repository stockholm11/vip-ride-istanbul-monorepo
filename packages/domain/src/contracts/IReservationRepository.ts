import { Reservation } from "../entities/Reservation";
import { AdminReservation } from "../entities/AdminReservation";
import { ReservationStatus } from "../enums/ReservationStatus";

export interface IReservationRepository {
  save(reservation: Reservation): Promise<Reservation>;
  findById(id: string): Promise<Reservation | null>;
  findAll(): Promise<Reservation[]>;
  updatePaymentStatus(id: string, status: ReservationStatus): Promise<void>;
  findAllAdmin(): Promise<AdminReservation[]>;
}

