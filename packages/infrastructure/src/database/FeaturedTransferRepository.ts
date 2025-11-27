import { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { pool } from "./connection";
import {
  FeaturedTransferPersistenceInput,
  IFeaturedTransferRepository,
} from "@vip-ride/domain/contracts/IFeaturedTransferRepository";
import { FeaturedTransfer } from "@vip-ride/domain/entities/FeaturedTransfer";

interface FeaturedTransferRow extends RowDataPacket {
  id: number;
  vehicleId: number;
  fromLocation: string;
  toLocation: string;
  estimatedTime: string;
  basePrice: number;
  displayOrder: number;
  isActive: number;
  createdAt: Date | null;
  updatedAt: Date | null;
  vehicleName: string | null;
  vehicleSlug: string | null;
  vehicleImageUrl: string | null;
  vehicleCapacity: number | null;
}

const normalizeImagePath = (value: string | null): string | null => {
  if (!value) {
    return null;
  }
  return value.startsWith("/") ? value : `/${value}`;
};

const BASE_SELECT = `
  SELECT
    ft.id,
    ft.vehicle_id AS vehicleId,
    ft.from_location AS fromLocation,
    ft.to_location AS toLocation,
    ft.estimated_time AS estimatedTime,
    ft.base_price AS basePrice,
    ft.display_order AS displayOrder,
    ft.is_active AS isActive,
    ft.created_at AS createdAt,
    ft.updated_at AS updatedAt,
    v.name AS vehicleName,
    v.slug AS vehicleSlug,
    v.image_url AS vehicleImageUrl,
    v.capacity AS vehicleCapacity
  FROM featured_transfers ft
  JOIN vehicles v ON v.id = ft.vehicle_id
`;

export class FeaturedTransferRepository implements IFeaturedTransferRepository {
  async findActive(): Promise<FeaturedTransfer[]> {
    return this.fetchTransfers(
      `${BASE_SELECT} WHERE ft.is_active = 1 ORDER BY ft.display_order ASC, ft.created_at DESC`
    );
  }

  async findAll(): Promise<FeaturedTransfer[]> {
    return this.fetchTransfers(
      `${BASE_SELECT} ORDER BY ft.display_order ASC, ft.created_at DESC`
    );
  }

  async findById(id: string): Promise<FeaturedTransfer | null> {
    const transfers = await this.fetchTransfers(`${BASE_SELECT} WHERE ft.id = ? LIMIT 1`, [
      Number(id),
    ]);
    return transfers[0] ?? null;
  }

  async create(data: FeaturedTransferPersistenceInput): Promise<FeaturedTransfer> {
    const sql = `
      INSERT INTO featured_transfers (
        vehicle_id,
        from_location,
        to_location,
        estimated_time,
        base_price,
        display_order,
        is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      Number(data.vehicleId),
      data.fromLocation,
      data.toLocation,
      data.estimatedTime,
      data.basePrice,
      data.displayOrder ?? 0,
      data.isActive === false ? 0 : 1,
    ];

    const [result] = await pool.execute<ResultSetHeader>(sql, params);
    const insertedId = result.insertId;
    const created = await this.findById(insertedId.toString());
    if (!created) {
      throw new Error("Failed to load featured transfer after create");
    }
    return created;
  }

  async update(id: string, data: FeaturedTransferPersistenceInput): Promise<FeaturedTransfer | null> {
    const sql = `
      UPDATE featured_transfers
      SET
        vehicle_id = ?,
        from_location = ?,
        to_location = ?,
        estimated_time = ?,
        base_price = ?,
        display_order = ?,
        is_active = ?
      WHERE id = ?
    `;

    const params = [
      Number(data.vehicleId),
      data.fromLocation,
      data.toLocation,
      data.estimatedTime,
      data.basePrice,
      data.displayOrder ?? 0,
      data.isActive === false ? 0 : 1,
      Number(id),
    ];

    await pool.execute<ResultSetHeader>(sql, params);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await pool.execute<ResultSetHeader>("DELETE FROM featured_transfers WHERE id = ?", [Number(id)]);
  }

  private async fetchTransfers(query: string, params: unknown[] = []): Promise<FeaturedTransfer[]> {
    const [rows] = await pool.query<FeaturedTransferRow[]>(query, params);
    return rows.map((row) => this.mapRowToEntity(row));
  }

  private mapRowToEntity(row: FeaturedTransferRow): FeaturedTransfer {
    return new FeaturedTransfer({
      id: row.id.toString(),
      vehicleId: row.vehicleId.toString(),
      vehicleName: row.vehicleName,
      vehicleSlug: row.vehicleSlug,
      vehicleImage: normalizeImagePath(row.vehicleImageUrl),
      passengerCapacity: row.vehicleCapacity,
      luggageCapacity:
        row.vehicleCapacity != null ? Math.max(1, Math.floor(row.vehicleCapacity / 2)) : null,
      fromLocation: row.fromLocation,
      toLocation: row.toLocation,
      estimatedTime: row.estimatedTime,
      basePrice: Number(row.basePrice),
      displayOrder: row.displayOrder,
      isActive: Boolean(row.isActive),
      createdAt: row.createdAt ?? undefined,
      updatedAt: row.updatedAt ?? undefined,
    });
  }
}


