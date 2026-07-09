import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";
import { AppError } from "../../errors/AppError";

export const validateRegister = (req: Request, res: Response, next: NextFunction) => {
    const { name, email, role, password } = req.body;
    if (!name) return next(new AppError(httpStatus.BAD_REQUEST, "Valid name is required"));
    if (!email) return next(new AppError(httpStatus.BAD_REQUEST, "Valid email is required"));
    if (!password) return next(new AppError(httpStatus.BAD_REQUEST, "password is required"));
    if (!role || !['LANDLORD', 'TENANT'].includes(role)) return next(new AppError(httpStatus.BAD_REQUEST, "Valid role (LANDLORD or TENANT) is required"));
    next();
};
