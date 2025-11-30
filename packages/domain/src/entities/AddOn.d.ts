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
export declare class AddOn {
    private readonly props;
    constructor(props: AddOnProps);
    get id(): string;
    get name(): string;
    get shortDescription(): string | null;
    get price(): number;
    get isActive(): boolean;
    get displayOrder(): number;
    get createdAt(): Date | null;
    get updatedAt(): Date | null;
    toJSON(): {
        id: string;
        name: string;
        shortDescription: string | null | undefined;
        price: number;
        isActive: boolean;
        displayOrder: number;
        createdAt: Date | null | undefined;
        updatedAt: Date | null | undefined;
    };
}
