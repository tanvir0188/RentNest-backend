import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { propertyService } from "./property.service";

const getAllProperties = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const filters = {
        location: req.query.location,
        price: req.query.price,
        type: req.query.type,
    };

    const options = {
        page: req.query.page,
        size: req.query.size,
    };

    const result = await propertyService.getAllProperties(filters, options);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Properties fetched successfully",
        meta: {
            page: result.meta.page,
            limit: result.meta.size,
            total: result.meta.total
        },
        data: result.data
    });
});

const getPropertyDetails = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params as { id: string };

    const result = await propertyService.getPropertyDetails(id);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Property details fetched successfully",
        data: result
    });
});

const createProperty = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await propertyService.createProperty(req.body);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Property created successfully",
        data: result
    });
});

const updateProperty = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params as { id: string };
    const result = await propertyService.updateProperty(id, req.body);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Property updated successfully",
        data: result
    });
});

const deleteProperty = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params as { id: string };
    const result = await propertyService.deleteProperty(id);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Property deleted successfully",
        data: result
    });
});

const createCategory = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await propertyService.createCategory(req.body);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Category created successfully",
        data: result
    });
});

const getAllCategories = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await propertyService.getAllCategories();

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Categories fetched successfully",
        data: result
    });
});

export const propertyController = {
    getAllProperties,
    getPropertyDetails,
    createProperty,
    updateProperty,
    deleteProperty,
    createCategory,
    getAllCategories
};
