import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { paymentService } from "./payment.service";

const createCheckoutSession = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id as string;
    const rentalRequestId = req.params.id as string;

    const result = await paymentService.createCheckoutSessionStripe(userId, rentalRequestId);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Checkout session created successfully",
        data: result
    });
});

const handleWebhook = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    await paymentService.listenWebhookAndStoreIntoDB(req, res);
});

const getPaymentById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id as string;
    const userId = req.user?.id as string;
    const role = req.user?.role as string;
    const result = await paymentService.getPaymentByIdDB(id, userId, role);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Payment details fetched successfully",
        data: result
    });
});

const getPaymentListByTenant = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id as string;
    const role = req.user?.role as string;
    const result = await paymentService.getPaymentListDB(userId, role);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Payments fetched successfully",
        data: result
    });
});

const changePaymentStatus = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const paymentId = req.params.id as string;
    const { status } = req.body;
    const result = await paymentService.changePaymentStatusDB(paymentId, status);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Payment status updated successfully",
        data: result
    });
});

export const paymentController = {
    createCheckoutSession,
    handleWebhook,
    getPaymentById,
    getPaymentListByTenant,
    changePaymentStatus
};
