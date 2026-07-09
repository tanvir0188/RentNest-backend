import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";
import { AppError } from "../../errors/AppError";

export const validateCreateReview = (req: Request, res: Response, next: NextFunction) => {
    const { rating, comment, rentalRequestId } = req.body;
    if (rating === undefined || rating < 1 || rating > 5) return next(new AppError(httpStatus.BAD_REQUEST, "Valid rating between 1 and 5 is required"));
    if (!comment) return next(new AppError(httpStatus.BAD_REQUEST, "Valid comment is required"));
    if (!rentalRequestId) return next(new AppError(httpStatus.BAD_REQUEST, "Valid rentalRequestId is required"));
    next();
};
