import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { userService } from "./user.service";
import { AppError } from "../../errors/AppError";



// const registerUser = async (req: Request, res: Response) => {
//     try {
//         const payload = req.body;

//         const user = await userService.registerUserIntoDB(payload);

//         res.status(httpStatus.CREATED).json({
//             success: true,
//             statusCode: httpStatus.CREATED,
//             message: "User registered successfully",
//             data: {
//                 user
//             }
//         });
//     } catch (error) {
//         console.log(error);

//         res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
//             success: false,
//             statusCode: httpStatus.INTERNAL_SERVER_ERROR,
//             message: "Failed to register user",
//             error: (error as Error).message
//         })

//     }
// }


const registerUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    const emailExist = await userService.emailExistInDB(payload.email);
    if (emailExist) {
        sendResponse(res, {
            success: false,
            statusCode: httpStatus.BAD_REQUEST,
            message: "Email already exists",
            data: null
        })
        return;
    }

    const user = await userService.registerUserIntoDB(payload);

    // res.status(httpStatus.CREATED).json({
    //     success: true,
    //     statusCode: httpStatus.CREATED,
    //     message: "User registered successfully",
    //     data: {
    //         user
    //     }
    // });

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "User registered successfully",
        data: { user }
    })
})

const getMyProfile = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    // const {accessToken} = req.cookies;
    // console.log(req.user, "user request");

    // const verifiedToken = jwtUtils.verifyToken(accessToken, config.jwt_access_secret)

    // if(typeof verifiedToken === "string"){
    //     throw new Error(verifiedToken);
    // }

    const profile = await userService.getMyProfileFromDB(req.user?.id as string);


    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "User profile fetched successfully",
        data: { profile }
    })
})

const updateMyProfile = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id as string;

    const payload = req.body;
    if (payload.email) {
        const emailExists = await userService.emailExistInDB(payload.email);
        if (emailExists) {
            sendResponse(res, {
                success: false,
                statusCode: httpStatus.BAD_REQUEST,
                message: "Email already exists",
                data: null
            })
            return;
        }
    }

    const updatedProfile = await userService.updateMyProfileInDB(userId, payload);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "User profile updated successfully",
        data: { updatedProfile }
    })
})

export const userController = {
    registerUser,
    getMyProfile,
    updateMyProfile
}