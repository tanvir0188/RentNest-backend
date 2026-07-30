import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { overviewService } from "./overview.service";

const getAdminOverview = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await overviewService.getAdminOverviewDB();
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Admin overview fetched successfully",
        data: result
    });
});

const getLandlordOverview = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id as string;
    const result = await overviewService.getLandlordOverviewDB(userId);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Landlord overview fetched successfully",
        data: result
    });
});

const getTenantOverview = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id as string;
    const result = await overviewService.getTenantOverviewDB(userId);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Tenant overview fetched successfully",
        data: result
    });
});

export const overviewController = {
    getAdminOverview,
    getLandlordOverview,
    getTenantOverview
};
