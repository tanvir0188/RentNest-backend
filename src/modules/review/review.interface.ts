export interface IReviewCreatePayload {
    rating: number;
    comment: string;
    rentalRequestId: string;
    userId?: string;
}
