import {
  ITourRepository,
  TourPersistenceInput,
} from "@vip-ride/domain/contracts/ITourRepository";
import { Tour } from "@vip-ride/domain/entities/Tour";
import { pool } from "./connection";
import { ResultSetHeader, RowDataPacket } from "mysql2/promise";

interface TourRow extends RowDataPacket {
  id: number;
  categoryId: number;
  categoryName: string;
  categorySlug: string;
  vehicleId: number;
  vehicleName: string;
  vehicleSlug: string;
  title: string;
  slug: string;
  shortDescription: string | null;
  longDescription: string | null;
  price: number;
  imageUrl: string | null;
  durationMinutes: number | null;
  capacity: number | null;
  vehicleCapacity: number | null;
  isActive: number;
  createdAt: Date | null;
}

export class TourRepository implements ITourRepository {
  async findAll(): Promise<Tour[]> {
    return this.fetchTours("WHERE t.is_active = 1");
  }

  async findAllAdmin(): Promise<Tour[]> {
    return this.fetchTours();
  }

  async findById(id: string): Promise<Tour | null> {
    const tours = await this.fetchTours("WHERE t.id = ?", [Number(id)]);
    return tours[0] ?? null;
  }

  async create(data: TourPersistenceInput): Promise<Tour> {
    const sql = `
      INSERT INTO tours (
        category_id,
        vehicle_id,
        title,
        slug,
        short_description,
        long_description,
        price,
        image_url,
        duration_minutes,
        is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const isActiveValue = data.isActive === true ? 1 : 0;
    const params = [
      Number(data.categoryId),
      Number(data.vehicleId),
      data.title,
      data.slug,
      data.shortDescription ?? null,
      data.longDescription ?? null,
      data.price,
      data.imageUrl ?? null,
      data.durationMinutes,
      isActiveValue,
    ];

    const [result] = await pool.execute<ResultSetHeader>(sql, params);
    const created = await this.findById(result.insertId.toString());
    if (!created) {
      throw new Error("Failed to load tour after create");
    }
    return created;
  }

  async update(id: string, data: TourPersistenceInput): Promise<Tour | null> {
    const sql = `
      UPDATE tours
      SET
        category_id = ?,
        vehicle_id = ?,
        title = ?,
        slug = ?,
        short_description = ?,
        long_description = ?,
        price = ?,
        image_url = ?,
        duration_minutes = ?,
        is_active = ?
      WHERE id = ?
    `;

    const isActiveValue = data.isActive === true ? 1 : 0;
    const params = [
      Number(data.categoryId),
      Number(data.vehicleId),
      data.title,
      data.slug,
      data.shortDescription ?? null,
      data.longDescription ?? null,
      data.price,
      data.imageUrl ?? null,
      data.durationMinutes,
      isActiveValue,
      Number(id),
    ];

    await pool.execute<ResultSetHeader>(sql, params);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await pool.execute<ResultSetHeader>("DELETE FROM tours WHERE id = ?", [Number(id)]);
  }

  private async fetchTours(
    whereClause?: string,
    params: unknown[] = []
  ): Promise<Tour[]> {
    const [rows] = await pool.query<TourRow[]>(
      `
        SELECT
          t.id,
          t.category_id AS categoryId,
          c.name AS categoryName,
          c.slug AS categorySlug,
          t.vehicle_id AS vehicleId,
          v.name AS vehicleName,
          v.slug AS vehicleSlug,
          t.title,
          t.slug,
          t.short_description AS shortDescription,
          t.long_description AS longDescription,
          t.price,
          t.image_url AS imageUrl,
          COALESCE(t.duration_minutes, NULL) AS durationMinutes,
          v.capacity,
          v.capacity AS vehicleCapacity,
          COALESCE(t.is_active, 0) AS isActive,
          t.created_at AS createdAt
        FROM tours t
        JOIN tour_categories c ON t.category_id = c.id
        JOIN vehicles v ON t.vehicle_id = v.id
        ${whereClause ?? ""}
        ORDER BY t.created_at DESC
      `,
      params
    );

    return rows.map((row) => this.mapRowToTour(row));
  }

  private mapRowToTour(row: TourRow): Tour {
    return new Tour({
      id: row.id.toString(),
      categoryId: row.categoryId.toString(),
      categoryName: row.categoryName,
      categorySlug: row.categorySlug,
      vehicleId: row.vehicleId.toString(),
      vehicleName: row.vehicleName,
      vehicleSlug: row.vehicleSlug,
      title: row.title,
      slug: row.slug,
      shortDescription: row.shortDescription,
      longDescription: row.longDescription,
      price: Number(row.price),
      imageUrl: row.imageUrl,
      durationMinutes: row.durationMinutes ?? null,
      capacity: row.capacity ?? row.vehicleCapacity ?? null,
      isActive: row.isActive === 1,
      createdAt: row.createdAt ? new Date(row.createdAt) : undefined,
    });
  }
}

