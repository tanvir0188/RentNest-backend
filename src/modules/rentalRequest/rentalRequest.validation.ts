import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";
import { AppError } from "../../errors/AppError";

export const validateAcceptRejectRequest = (req: Request, res: Response, next: NextFunction) => {
    const { status } = req.body;
    if (!status || !['APPROVED', 'REJECTED'].includes(status)) {
        return next(new AppError(httpStatus.BAD_REQUEST, "Valid status (APPROVED or REJECTED) is required"));
    }
    next();
};
