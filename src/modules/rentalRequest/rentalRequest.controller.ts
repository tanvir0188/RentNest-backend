import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { rentalRequestService } from "./rentalRequest.service";
import type { RequestStatus } from "../../../generated/prisma/enums";

const createRentalRequest = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id as string;
    const propertyId: string = req.params.id as string;
    const result = await rentalRequestService.createRentalRequestIntoDB(userId, propertyId);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Rental request created successfully",
        data: result
    });
});

const getAllRentalRequestsByTenant = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id as string;
    const result = await rentalRequestService.getAllRentalRequestsFromDBByUserId(userId);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Rental requests fetched successfully",
        data: result
    });
});

const getAllRentalRequestsByLandLord = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id as string;
    const result = await rentalRequestService.getRentalRequestsForLandLordDB(userId);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Rental requests fetched successfully",
        data: result
    });
});

const getRentalRequestDetail = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const requestId = req.params.id as string;
    const result = await rentalRequestService.getRentalRequestDetailDB(requestId);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Rental request fetched successfully",
        data: result
    });
});

const getAllRequests = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await rentalRequestService.getAllRentalRequestFromDb();
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Rental requests fetched successfully",
        data: result
    });
});

const acceptOrRejectRentalRequest = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const requestId = req.params.id as string;
    const userId = req.user?.id as string;
    const status = req.body.status as RequestStatus;
    const result = await rentalRequestService.acceptOrRejectRentalRequestDB(requestId, userId, status);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: `Rental request ${status} successfully`,
        data: result
    });
});

const markAsCompleted = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const requestId = req.params.id as string;
    const userId = req.user?.id as string;
    const result = await rentalRequestService.markAsCompletedDB(requestId, userId);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: `Rental request marked as completed successfully`,
        data: result
    });
});

export const rentalRequestController = {
    createRentalRequest,
    getAllRentalRequestsByTenant,
    getAllRentalRequestsByLandLord,
    getRentalRequestDetail,
    getAllRequests,
    acceptOrRejectRentalRequest,
    markAsCompleted
};

