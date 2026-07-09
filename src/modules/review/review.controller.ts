import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { reviewService } from "./review.service";

const createReview = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id as string;
    const role = req.user?.role as string;
    const result = await reviewService.createReviewDB(userId, role, req.body);
    
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Review created successfully",
        data: result
    });
});

const updateReview = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const reviewId = req.params.id as string;
    const userId = req.user?.id as string;
    const role = req.user?.role as string;
    const result = await reviewService.updateReviewDB(reviewId, userId, role, req.body);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Review updated successfully",
        data: result
    });
});

export const reviewController = {
    createReview,
    updateReview
};
