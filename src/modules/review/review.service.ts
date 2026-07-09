import { prisma } from "../../lib/prisma";
import { AppError } from "../../errors/AppError";
import httpStatus from "http-status";
import { PaymentStatus } from "../../../generated/prisma/enums";
import { IReviewCreatePayload } from "./review.interface";

const createReviewDB = async (userId: string, data: IReviewCreatePayload) => {
    let { rentalRequestId, rating, comment } = data;

    if (rating < 1 || rating > 5) {
        throw new AppError(httpStatus.BAD_REQUEST, "Rating must be between 1 and 5");
    }

    const rentalRequest = await prisma.rentalRequest.findUnique({
        where: { id: rentalRequestId },
        include: { payment: true }
    });

    if (!rentalRequest) {
        throw new AppError(httpStatus.NOT_FOUND, "Rental request not found");
    }

    if (rentalRequest.userId !== userId) {
        throw new AppError(httpStatus.FORBIDDEN, "You are not authorized to review this Property");
    }

    if (!rentalRequest.payment || rentalRequest.payment.status !== PaymentStatus.SUCCESS) {
        throw new AppError(httpStatus.BAD_REQUEST, "You can only review properties for which you have paid the rental request");
    }

    const existingReview = await prisma.review.findUnique({
        where: { rentalRequestId }
    });

    if (existingReview) {
        throw new AppError(httpStatus.BAD_REQUEST, "You have already reviewed this rental request");
    }

    const review = await prisma.review.create({
        data: {
            rating,
            comment,
            userId,
            rentalRequestId,
            propertyId: rentalRequest.propertyId
        }
    });

    return review;
};

export const reviewService = {
    createReviewDB
};
