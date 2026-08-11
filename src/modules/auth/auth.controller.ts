import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { authService } from "./auth.service";

const loginUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;

    const { accessToken, refreshToken } = await authService.loginUser(payload);

    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 1000 * 60 * 60 * 24 // 24 hour or 1 day
    })

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 1000 * 60 * 60 * 24 * 7 // 7 day
    })

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "User logged in successfully",
        data: { accessToken, refreshToken }
    });
});

const refreshToken = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies.refreshToken;

    const { accessToken } = await authService.refreshToken(refreshToken);

    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 1000 * 60 * 60 * 24 // 24 hour or 1 day
    })

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Token Refreshed Successfully",
        data: {
            accessToken
        }
    })
})

const googleAuthCallback = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    console.log(`[AuthController] googleAuthCallback started for user:`, req.user?.email);
    // req.user contains the Google profile passed from passport config
    const { accessToken, refreshToken, role } = await authService.googleLogin(req.user);
    console.log(`[AuthController] Tokens generated successfully for role: ${role}`);

    // Redirect to frontend application with tokens as query params
    // Cross-domain cookies are blocked by modern browsers, so we pass tokens in the URL
    // The frontend should extract these and store them appropriately
    const redirectMap: Record<string, string> = {
        ADMIN: "dashboard/admin",
        LANDLORD: "dashboard/landlord",
        TENANT: "dashboard/tenant"
    };
    const redirectPath = redirectMap[role] || "dashboard/tenant";
    const finalRedirectUrl = `${process.env.APP_URL}/${redirectPath}?accessToken=${accessToken}&refreshToken=${refreshToken}`;

    console.log(`[AuthController] Redirecting user to: ${process.env.APP_URL}/${redirectPath}`);
    console.log(`[AuthController] final redirect url: ${finalRedirectUrl}`)
    res.redirect(finalRedirectUrl);
});

export const authController = {
    loginUser,
    refreshToken,
    googleAuthCallback
}