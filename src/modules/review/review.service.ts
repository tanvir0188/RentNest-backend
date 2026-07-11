import { prisma } from "../../lib/prisma";
import { AppError } from "../../errors/AppError";
import httpStatus from "http-status";
import { PaymentStatus, RequestStatus, Role } from "../../../generated/prisma/enums";
import { IReviewCreatePayload } from "./review.interface";

const createReviewDB = async (userId: string, role: string, data: IReviewCreatePayload) => {
    let { rentalRequestId, rating, comment } = data;

    if (rating < 1 || rating > 5) {
        throw new AppError(httpStatus.BAD_REQUEST, "Rating must be between 1 and 5");
    }

    // When admin creates a review, they must provide a valid userId in the payload
    const reviewUserId = role === Role.ADMIN && data.userId ? data.userId : userId;

    if (role === Role.ADMIN && data.userId) {
        const targetUser = await prisma.user.findUnique({
            where: { id: data.userId }
        });
        if (!targetUser) {
            throw new AppError(httpStatus.BAD_REQUEST, "The provided user ID does not exist");
        }
        if (targetUser.role !== Role.TENANT) {
            throw new AppError(httpStatus.BAD_REQUEST, "The provided user ID does not belong to a user with the TENANT role");
        }
    }

    const rentalRequest = await prisma.rentalRequest.findUnique({
        where: { id: rentalRequestId },
        include: { payment: true },
    });

    if (!rentalRequest) {
        throw new AppError(httpStatus.NOT_FOUND, "Rental request not found");
    }

    // Non-admin users can only review their own rental requests
    if (role !== Role.ADMIN && rentalRequest.userId !== reviewUserId) {
        throw new AppError(httpStatus.FORBIDDEN, "You are not authorized to review this property");
    }

    if (!rentalRequest.payment || rentalRequest.payment.status !== PaymentStatus.SUCCESS) {
        throw new AppError(httpStatus.BAD_REQUEST, "You can only review properties for which the rental request payment has been completed");
    }
    if (rentalRequest.status !== RequestStatus.COMPLETED) {
        throw new AppError(httpStatus.BAD_REQUEST, "You can only review properties for which the rental request is completed");
    }

    const existingReview = await prisma.review.findUnique({
        where: { rentalRequestId }
    });

    if (existingReview) {
        throw new AppError(httpStatus.BAD_REQUEST, "A review already exists for this rental request");
    }

    const review = await prisma.review.create({
        data: {
            rating,
            comment,
            userId: reviewUserId,
            rentalRequestId,
            propertyId: rentalRequest.propertyId
        }
    });

    return review;
};

const updateReviewDB = async (reviewId: string, userId: string, role: string, data: { rating?: number; comment?: string; userId?: string }) => {
    const review = await prisma.review.findUnique({
        where: { id: reviewId }
    });

    if (!review) {
        throw new AppError(httpStatus.NOT_FOUND, "Review not found");
    }

    if (role !== Role.ADMIN && review.userId !== userId) {
        throw new AppError(httpStatus.FORBIDDEN, "You are not authorized to update this review");
    }

    if (role === Role.ADMIN && data.userId) {
        const targetUser = await prisma.user.findUnique({
            where: { id: data.userId }
        });
        if (!targetUser) {
            throw new AppError(httpStatus.BAD_REQUEST, "The provided user ID does not exist");
        }
        if (targetUser.role !== Role.TENANT) {
            throw new AppError(httpStatus.BAD_REQUEST, "The provided user ID does not belong to a user with the TENANT role");
        }
    }

    if (data.rating !== undefined && (data.rating < 1 || data.rating > 5)) {
        throw new AppError(httpStatus.BAD_REQUEST, "Rating must be between 1 and 5");
    }

    const updateData: any = {};
    if (data.rating !== undefined) updateData.rating = data.rating;
    if (data.comment !== undefined) updateData.comment = data.comment;
    if (data.userId && role === Role.ADMIN) updateData.userId = data.userId;

    const updatedReview = await prisma.review.update({
        where: { id: reviewId },
        data: updateData
    });

    return updatedReview;
};

const deleteReviewDB = async (reviewId: string) => {
    const review = await prisma.review.findUnique({
        where: { id: reviewId }
    });

    if (!review) {
        throw new AppError(httpStatus.NOT_FOUND, "Review not found");
    }

    const deletedReview = await prisma.review.delete({
        where: { id: reviewId }
    });

    return deletedReview;
};

export const reviewService = {
    createReviewDB,
    updateReviewDB,
    deleteReviewDB
};
