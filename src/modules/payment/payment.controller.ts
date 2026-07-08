import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { paymentService } from "./payment.service";

const createCheckoutSession = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id as string;
    const { price, rentalRequestId } = req.body;

    const result = await paymentService.createCheckoutSessionStripe(userId, price, rentalRequestId);

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

export const paymentController = {
    createCheckoutSession,
    handleWebhook
};
