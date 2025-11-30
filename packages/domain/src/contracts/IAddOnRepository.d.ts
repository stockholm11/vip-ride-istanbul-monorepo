import { AddOn } from "../entities/AddOn";
export interface AddOnPersistenceInput {
    name: string;
    shortDescription?: string | null;
    price: number;
    isActive: boolean;
    displayOrder: number;
}
export interface IAddOnRepository {
    findAll(): Promise<AddOn[]>;
    findActive(): Promise<AddOn[]>;
    findById(id: string): Promise<AddOn | null>;
    save(addOn: AddOnPersistenceInput): Promise<AddOn>;
    update(id: string, addOn: Partial<AddOnPersistenceInput>): Promise<AddOn>;
    delete(id: string): Promise<void>;
}
