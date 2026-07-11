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
        amenity: req.query.amenity
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

const getPropertiesForLandlord = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const landLordId = req.user?.id;
    const result = await propertyService.getPropertiesForLandlord(landLordId as string);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Properties fetched successfully",
        data: result
    });
});

const createProperty = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const landLordId = req.user?.id; 
    console.log("Landlord ID:", landLordId); 
    const result = await propertyService.createProperty({ ...req.body, landLordId }, landLordId as string);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED, 
        message: "Property created successfully",
        data: result
    });
});

const updateProperty = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params as { id: string };
    const user = req.user as any;
    const result = await propertyService.updateProperty(id, req.body, user.id, user.role);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Property updated successfully",
        data: result
    });
});

const deleteProperty = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params as { id: string };
    const user = req.user as any;
    const result = await propertyService.deleteProperty(id, user.id, user.role);

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

const deleteCategory = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params as { id: string };
    const result = await propertyService.deleteCategory(id);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Category deleted successfully",
        data: result
    });
});

const updateCategory = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params as { id: string };
    const result = await propertyService.updateCategory(id, req.body);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Category updated successfully",
        data: result
    });
});

const createAmenity = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await propertyService.createAmenity(req.body);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Amenity created successfully",
        data: result
    });
});

const getAllAmenities = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await propertyService.getAllAmenities();

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Amenities fetched successfully",
        data: result
    });
});

const updateAmenity = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params as { id: string };
    const result = await propertyService.updateAmenity(id, req.body);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Amenity updated successfully",
        data: result
    });
});

const deleteAmenity = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params as { id: string };
    const result = await propertyService.deleteAmenity(id);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Amenity deleted successfully",
        data: result
    });
});

export const propertyController = {
    getAllProperties,
    getPropertyDetails,
    getPropertiesForLandlord,
    createProperty,
    updateProperty,
    deleteProperty,
    createCategory,
    deleteCategory,
    updateCategory,
    getAllCategories,
    createAmenity,
    getAllAmenities,
    updateAmenity,
    deleteAmenity
};
