import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";
import { AppError } from "../../errors/AppError";

export const validateLogin = (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    if (!email) return next(new AppError(httpStatus.BAD_REQUEST, "Valid email is required"));
    if (!password) return next(new AppError(httpStatus.BAD_REQUEST, "Valid password is required"));
    next();
};
