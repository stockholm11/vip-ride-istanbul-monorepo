export interface TourCategoryProps {
  id: string;
  name: string;
  slug: string;
  createdAt?: Date;
}

export class TourCategory {
  constructor(private readonly props: TourCategoryProps) {}

  get data() {
    return this.props;
  }
}

