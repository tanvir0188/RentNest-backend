import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";
import { AppError } from "../../errors/AppError";

export const validateCreateProperty = (req: Request, res: Response, next: NextFunction) => {
    if (typeof req.body.data === "string") {
        try {
            const parsed = JSON.parse(req.body.data);
            req.body = { ...parsed, ...req.body };
            delete req.body.data;
        } catch {
            // ignore
        }
    }

    const { title, price, image, type, location, categoryId, description } = req.body;
    if (!title) return next(new AppError(httpStatus.BAD_REQUEST, "Valid title is required"));
    if (price === undefined || price === "" || isNaN(Number(price))) {
        return next(new AppError(httpStatus.BAD_REQUEST, "Valid price is required"));
    }
    if (!type) return next(new AppError(httpStatus.BAD_REQUEST, "Valid type is required"));
    if (!location) return next(new AppError(httpStatus.BAD_REQUEST, "Valid location is required"));
    if (!categoryId) return next(new AppError(httpStatus.BAD_REQUEST, "Valid categoryId is required"));
    if (!description) return next(new AppError(httpStatus.BAD_REQUEST, "Valid description is required"));

    // image is optional, if provided ensure valid URL or base64 data URI
    if (image) {
        if (typeof image !== "string") {
            return next(new AppError(httpStatus.BAD_REQUEST, "Image must be a valid URL"));
        }

        if (!image.startsWith("data:image/")) {
            try {
                new URL(image);
            } catch {
                return next(new AppError(httpStatus.BAD_REQUEST, "Image must be a valid URL"));
            }
        }
    }
    next();
};


export const validateAddAmenity = (req: Request, res: Response, next: NextFunction) => {
    const { amenityId } = req.body;
    if (!amenityId) return next(new AppError(httpStatus.BAD_REQUEST, "Valid amenityId is required"));
    next();
};

export const validateCreateCategory = (req: Request, res: Response, next: NextFunction) => {
    const { title } = req.body;
    if (!title) return next(new AppError(httpStatus.BAD_REQUEST, "Valid category title is required"));
    next();
};

export const validateCreateAmenity = (req: Request, res: Response, next: NextFunction) => {
    const { title } = req.body;
    if (!title) return next(new AppError(httpStatus.BAD_REQUEST, "Valid amenity title is required"));
    next();
};
