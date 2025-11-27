export interface AddOnProps {
  id: string;
  name: string;
  shortDescription?: string | null;
  price: number;
  isActive: boolean;
  displayOrder: number;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

export class AddOn {
  constructor(private readonly props: AddOnProps) {}

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get shortDescription(): string | null {
    return this.props.shortDescription ?? null;
  }

  get price(): number {
    return this.props.price;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get displayOrder(): number {
    return this.props.displayOrder;
  }

  get createdAt(): Date | null {
    return this.props.createdAt ?? null;
  }

  get updatedAt(): Date | null {
    return this.props.updatedAt ?? null;
  }

  toJSON() {
    return {
      id: this.props.id,
      name: this.props.name,
      shortDescription: this.props.shortDescription,
      price: this.props.price,
      isActive: this.props.isActive,
      displayOrder: this.props.displayOrder,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    };
  }
}

