import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";
import { AppError } from "../../errors/AppError";

export const validateCreateProperty = (req: Request, res: Response, next: NextFunction) => {
    const { title, price, type, location, categoryId } = req.body;
    if (!title) return next(new AppError(httpStatus.BAD_REQUEST, "Valid title is required"));
    if (price === undefined) return next(new AppError(httpStatus.BAD_REQUEST, "Valid price is required"));
    if (!type) return next(new AppError(httpStatus.BAD_REQUEST, "Valid type is required"));
    if (!location) return next(new AppError(httpStatus.BAD_REQUEST, "Valid location is required"));
    if (!categoryId) return next(new AppError(httpStatus.BAD_REQUEST, "Valid categoryId is required"));
    next();
};


export const validateAddAmenity = (req: Request, res: Response, next: NextFunction) => {
    const { amenityId } = req.body;
    if (!amenityId) return next(new AppError(httpStatus.BAD_REQUEST, "Valid amenityId is required"));
    next();
};

export const validateCreateCategory = (req: Request, res: Response, next: NextFunction) => {
    const { name } = req.body;
    if (!name) return next(new AppError(httpStatus.BAD_REQUEST, "Valid category name is required"));
    next();
};

export const validateCreateAmenity = (req: Request, res: Response, next: NextFunction) => {
    const { name } = req.body;
    if (!name) return next(new AppError(httpStatus.BAD_REQUEST, "Valid amenity name is required"));
    next();
};
