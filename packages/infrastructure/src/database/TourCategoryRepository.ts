import {
  ITourCategoryRepository,
  TourCategoryPersistenceInput,
} from "@vip-ride/domain/contracts/ITourCategoryRepository";
import { TourCategory } from "@vip-ride/domain/entities/TourCategory";
import { pool } from "./connection";
import { ResultSetHeader, RowDataPacket } from "mysql2/promise";

interface TourCategoryRow extends RowDataPacket {
  id: number;
  name: string;
  slug: string;
  createdAt: Date | null;
}

export class TourCategoryRepository implements ITourCategoryRepository {
  async findAll(): Promise<TourCategory[]> {
    return this.fetchCategories();
  }

  async findAllAdmin(): Promise<TourCategory[]> {
    return this.fetchCategories();
  }

  async findById(id: string): Promise<TourCategory | null> {
    const categories = await this.fetchCategories("WHERE id = ?", [Number(id)]);
    return categories[0] ?? null;
  }

  async create(data: TourCategoryPersistenceInput): Promise<TourCategory> {
    const sql = `
      INSERT INTO tour_categories (name, slug)
      VALUES (?, ?)
    `;
    const [result] = await pool.execute<ResultSetHeader>(sql, [data.name, data.slug]);
    const created = await this.findById(result.insertId.toString());
    if (!created) {
      throw new Error("Failed to load category after create");
    }
    return created;
  }

  async update(id: string, data: TourCategoryPersistenceInput): Promise<TourCategory | null> {
    const sql = `
      UPDATE tour_categories
      SET name = ?, slug = ?
      WHERE id = ?
    `;
    await pool.execute<ResultSetHeader>(sql, [data.name, data.slug, Number(id)]);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await pool.execute<ResultSetHeader>("DELETE FROM tour_categories WHERE id = ?", [Number(id)]);
  }

  private async fetchCategories(
    whereClause?: string,
    params: unknown[] = []
  ): Promise<TourCategory[]> {
    const [rows] = await pool.query<TourCategoryRow[]>(
      `
        SELECT
          id,
          name,
          slug,
          created_at AS createdAt
        FROM tour_categories
        ${whereClause ?? ""}
        ORDER BY created_at DESC
      `,
      params
    );

    return rows.map((row) => this.mapRowToCategory(row));
  }

  private mapRowToCategory(row: TourCategoryRow): TourCategory {
    return new TourCategory({
      id: row.id.toString(),
      name: row.name,
      slug: row.slug,
      createdAt: row.createdAt ? new Date(row.createdAt) : undefined,
    });
  }
}

