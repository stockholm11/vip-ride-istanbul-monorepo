export interface AddOnDTO {
  id: string;
  name: string;
  shortDescription?: string | null;
  price: number;
  isActive: boolean;
  displayOrder: number;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

export interface CreateAddOnDTO {
  name: string;
  shortDescription?: string | null;
  price: number;
  isActive: boolean;
  displayOrder: number;
}

export interface UpdateAddOnDTO {
  name?: string;
  shortDescription?: string | null;
  price?: number;
  isActive?: boolean;
  displayOrder?: number;
}

