import {
  IAddOnRepository,
  AddOnPersistenceInput,
} from "@vip-ride/domain/contracts/IAddOnRepository";
import { AddOn } from "@vip-ride/domain/entities/AddOn";
import { pool } from "./connection";
import { ResultSetHeader, RowDataPacket } from "mysql2/promise";

interface AddOnRow extends RowDataPacket {
  id: number;
  name: string;
  short_description: string | null;
  price: number;
  is_active: number;
  display_order: number;
  created_at: Date | null;
  updated_at: Date | null;
}

export class AddOnRepository implements IAddOnRepository {
  async findAll(): Promise<AddOn[]> {
    const [rows] = await pool.query<AddOnRow[]>(
      `
        SELECT 
          id,
          name,
          short_description,
          price,
          is_active,
          display_order,
          created_at,
          updated_at
        FROM add_ons
        ORDER BY display_order ASC, created_at DESC
      `
    );

    return rows.map((row) => this.mapRowToAddOn(row));
  }

  async findActive(): Promise<AddOn[]> {
    const [rows] = await pool.query<AddOnRow[]>(
      `
        SELECT 
          id,
          name,
          short_description,
          price,
          is_active,
          display_order,
          created_at,
          updated_at
        FROM add_ons
        WHERE is_active = 1
        ORDER BY display_order ASC, created_at DESC
      `
    );

    return rows.map((row) => this.mapRowToAddOn(row));
  }

  async findById(id: string): Promise<AddOn | null> {
    const [rows] = await pool.query<AddOnRow[]>(
      `
        SELECT 
          id,
          name,
          short_description,
          price,
          is_active,
          display_order,
          created_at,
          updated_at
        FROM add_ons
        WHERE id = ?
      `,
      [Number(id)]
    );

    if (rows.length === 0) {
      return null;
    }

    return this.mapRowToAddOn(rows[0]);
  }

  async save(input: AddOnPersistenceInput): Promise<AddOn> {
    const [result] = await pool.query<ResultSetHeader>(
      `
        INSERT INTO add_ons (
          name,
          short_description,
          price,
          is_active,
          display_order
        ) VALUES (?, ?, ?, ?, ?)
      `,
      [
        input.name,
        input.shortDescription ?? null,
        input.price,
        input.isActive ? 1 : 0,
        input.displayOrder,
      ]
    );

    const saved = await this.findById(result.insertId.toString());
    if (!saved) {
      throw new Error("Failed to save add-on");
    }

    return saved;
  }

  async update(id: string, input: Partial<AddOnPersistenceInput>): Promise<AddOn> {
    const updates: string[] = [];
    const values: unknown[] = [];

    if (input.name !== undefined) {
      updates.push("name = ?");
      values.push(input.name);
    }
    if (input.shortDescription !== undefined) {
      updates.push("short_description = ?");
      values.push(input.shortDescription);
    }
    if (input.price !== undefined) {
      updates.push("price = ?");
      values.push(input.price);
    }
    if (input.isActive !== undefined) {
      updates.push("is_active = ?");
      values.push(input.isActive ? 1 : 0);
    }
    if (input.displayOrder !== undefined) {
      updates.push("display_order = ?");
      values.push(input.displayOrder);
    }

    if (updates.length === 0) {
      const existing = await this.findById(id);
      if (!existing) {
        throw new Error("Add-on not found");
      }
      return existing;
    }

    values.push(Number(id));

    await pool.query(
      `
        UPDATE add_ons
        SET ${updates.join(", ")}
        WHERE id = ?
      `,
      values
    );

    const updated = await this.findById(id);
    if (!updated) {
      throw new Error("Failed to update add-on");
    }

    return updated;
  }

  async delete(id: string): Promise<void> {
    await pool.query<ResultSetHeader>("DELETE FROM add_ons WHERE id = ?", [
      Number(id),
    ]);
  }

  private mapRowToAddOn(row: AddOnRow): AddOn {
    return new AddOn({
      id: row.id.toString(),
      name: row.name,
      shortDescription: row.short_description,
      price: Number(row.price),
      isActive: row.is_active === 1,
      displayOrder: row.display_order,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }
}

