export interface TourCategoryProps {
    id: string;
    name: string;
    slug: string;
    createdAt?: Date;
}
export declare class TourCategory {
    private readonly props;
    constructor(props: TourCategoryProps);
    get data(): TourCategoryProps;
}
