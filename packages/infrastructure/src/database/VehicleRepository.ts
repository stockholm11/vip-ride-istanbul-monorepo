import {
  IVehicleRepository,
  VehiclePersistenceInput,
} from "@vip-ride/domain/contracts/IVehicleRepository";
import { Vehicle, VehicleType } from "@vip-ride/domain/entities/Vehicle";
import { pool } from "./connection";
import { ResultSetHeader, RowDataPacket } from "mysql2/promise";

interface VehicleRow extends RowDataPacket {
  id: number;
  name: string;
  slug: string;
  types: string | string[] | null; // MySQL JSON can be string, array, or null
  capacity: number;
  basePrice: number;
  kmPrice: number;
  imageUrl: string | null;
  description: string | null;
  createdAt: Date | null;
}

export class VehicleRepository implements IVehicleRepository {
  async findAll(): Promise<Vehicle[]> {
    return this.fetchVehicles();
  }

  async findByType(type: VehicleType): Promise<Vehicle[]> {
    return this.fetchVehicles("WHERE JSON_CONTAINS(types, ?)", [JSON.stringify(type)]);
  }

  async findAllAdmin(): Promise<Vehicle[]> {
    return this.fetchVehicles();
  }

  async findById(id: string): Promise<Vehicle | null> {
    const vehicles = await this.fetchVehicles("WHERE id = ?", [Number(id)]);
    return vehicles[0] ?? null;
  }

  async create(data: VehiclePersistenceInput): Promise<Vehicle> {
    const sql = `
      INSERT INTO vehicles (
        name,
        slug,
        types,
        capacity,
        base_price,
        km_price,
        image_url,
        description
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const types = Array.isArray(data.types) && data.types.length > 0 ? data.types : ["transfer"];
    const params = [
      data.name,
      data.slug,
      JSON.stringify(types),
      data.capacity,
      data.basePrice,
      data.kmPrice,
      data.imageUrl ?? null,
      data.description ?? null,
    ];

    const [result] = await pool.execute<ResultSetHeader>(sql, params);
    const created = await this.findById(result.insertId.toString());
    if (!created) {
      throw new Error("Failed to load vehicle after create");
    }
    return created;
  }

  async update(id: string, data: VehiclePersistenceInput): Promise<Vehicle | null> {
    const sql = `
      UPDATE vehicles
      SET
        name = ?,
        slug = ?,
        types = ?,
        capacity = ?,
        base_price = ?,
        km_price = ?,
        image_url = ?,
        description = ?
      WHERE id = ?
    `;

    const types = Array.isArray(data.types) && data.types.length > 0 ? data.types : ["transfer"];
    const params = [
      data.name,
      data.slug,
      JSON.stringify(types),
      data.capacity,
      data.basePrice,
      data.kmPrice,
      data.imageUrl ?? null,
      data.description ?? null,
      Number(id),
    ];

    await pool.execute<ResultSetHeader>(sql, params);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await pool.execute<ResultSetHeader>("DELETE FROM vehicles WHERE id = ?", [Number(id)]);
  }

  private async fetchVehicles(
    whereClause?: string,
    params: unknown[] = []
  ): Promise<Vehicle[]> {
    const [rows] = await pool.query<VehicleRow[]>(
      `
        SELECT
          id,
          name,
          slug,
          types,
          capacity,
          base_price AS basePrice,
          km_price AS kmPrice,
          image_url AS imageUrl,
          description,
          created_at AS createdAt
        FROM vehicles
        ${whereClause ?? ""}
        ORDER BY created_at DESC
      `,
      params
    );

    return rows.map((row) => this.mapRowToVehicle(row));
  }

  private mapRowToVehicle(row: VehicleRow): Vehicle {
    let types: VehicleType[] = ["transfer"];
  
    try {
      const raw = row.types;
  
      // Case 1: MySQL returns JSON as JS array (mysql2 with jsonStrings: false)
      if (Array.isArray(raw)) {
        const validTypes = raw.filter(
          (t): t is VehicleType => t === "transfer" || t === "chauffeur"
        );
        types = validTypes.length > 0 ? validTypes : ["transfer"];
      }
      // Case 2: MySQL returns JSON as string (mysql2 with jsonStrings: true or default)
      else if (typeof raw === "string" && raw.trim()) {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            const validTypes = parsed.filter(
              (t): t is VehicleType => t === "transfer" || t === "chauffeur"
            );
            types = validTypes.length > 0 ? validTypes : ["transfer"];
          }
        } catch (parseError) {
          types = ["transfer"];
        }
      }
      // Case 3: null or empty string
      else if (raw === null || raw === undefined || (typeof raw === "string" && !raw.trim())) {
        types = ["transfer"];
      }
  
      // Final validation: ensure at least one type and remove duplicates
      if (!types.length || types.length === 0) {
        types = ["transfer"];
      }
      types = [...new Set(types)];
  
    } catch (error) {
      types = ["transfer"];
    }
  
    return new Vehicle({
      id: row.id.toString(),
      name: row.name,
      slug: row.slug,
      types,
      capacity: row.capacity,
      basePrice: Number(row.basePrice),
      kmPrice: Number(row.kmPrice),
      imageUrl: row.imageUrl,
      description: row.description,
      createdAt: row.createdAt ? new Date(row.createdAt) : undefined,
    });
  }  
}

