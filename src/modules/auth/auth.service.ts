import bcrypt from "bcryptjs";
import crypto from "crypto";
import httpStatus from "http-status";
import { JwtPayload, SignOptions } from "jsonwebtoken";
import config from "../../config";
import { AppError } from "../../errors/AppError";
import { prisma } from "../../lib/prisma";
import { jwtUtils } from "../../utils/jwt";
import { ILoginUser } from "./auth.interface";

const loginUser = async (payload: ILoginUser) => {
    const { email, password } = payload;

    // const user = await prisma.user.findUnique({
    //     where : {email}
    // })

    // if(!user){
    //     throw new Error("User not found");
    // }

    // const user = await prisma.user.findUniqueOrThrow({
    //     where: { email }
    // })

    const user = await prisma.user.findUnique({
        where: { email }
    })
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    if (user.activeStatus === "BLOCKED") {
        throw new AppError(httpStatus.FORBIDDEN, "Your account has been blocked. Please contact support.");
    }

    const isPasswordMatched = await bcrypt.compare(password, user.password);

    if (!isPasswordMatched) {
        throw new AppError(httpStatus.UNAUTHORIZED, "Password is incorrect");
    }

    const jwtPayload = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
    }

    // const accessToken = jwt.sign(
    //     jwtPayload, 
    //     config.jwt_access_secret, 
    //     {
    //         expiresIn : config.jwt_access_expires_in
    //     } as SignOptions
    // )

    const accessToken = jwtUtils.createToken(
        jwtPayload,
        config.jwt_access_secret,
        config.jwt_access_expires_in as SignOptions
    );

    // const refreshToken = jwt.sign(
    //     jwtPayload, 
    //     config.jwt_refresh_secret, 
    //     {
    //         expiresIn : config.jwt_refresh_expires_in
    //     } as SignOptions
    // );

    const refreshToken = jwtUtils.createToken(
        jwtPayload,
        config.jwt_refresh_secret,
        config.jwt_refresh_expires_in as SignOptions
    );

    return {
        accessToken,
        refreshToken
    };
}

const refreshToken = async (refreshToken: string) => {
    const verifiedRefreshToken = jwtUtils.verifyToken(refreshToken, config.jwt_refresh_secret);

    if (!verifiedRefreshToken.success) {
        throw new Error(verifiedRefreshToken.error)
    }

    const { id } = verifiedRefreshToken.data as JwtPayload;

    const user = await prisma.user.findUniqueOrThrow({
        where: {
            id
        }
    })

    if (user.activeStatus === "BLOCKED") {
        throw new Error("User is blocked!")
    }

    const jwtPayload = {
        id,
        name: user.name,
        email: user.email,
        role: user.role
    }


    const accessToken = jwtUtils.createToken(
        jwtPayload,
        config.jwt_access_secret,
        config.jwt_access_expires_in as SignOptions
    );

    return { accessToken }
}
const googleLogin = async (profile: any) => {
    const email = profile.emails?.[0].value;
    const name = profile.displayName;

    if (!email) {
        throw new AppError(httpStatus.BAD_REQUEST, "Email is required from Google profile");
    }

    let user = await prisma.user.findUnique({
        where: { email }
    });

    if (!user) {
        // Generate a dummy password for social login users
        const dummyPassword = await bcrypt.hash(crypto.randomUUID(), Number(config.bcrypt_salt_rounds) || 12);
        
        user = await prisma.user.create({
            data: {
                email,
                name,
                password: dummyPassword,
                role: "TENANT",
                activeStatus: "ACTIVE"
            }
        });
    }

    if (user.activeStatus === "BLOCKED") {
        throw new AppError(httpStatus.FORBIDDEN, "Your account has been blocked. Please contact support.");
    }

    const jwtPayload = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
    }

    const accessToken = jwtUtils.createToken(
        jwtPayload,
        config.jwt_access_secret,
        config.jwt_access_expires_in as SignOptions
    );

    const refreshToken = jwtUtils.createToken(
        jwtPayload,
        config.jwt_refresh_secret,
        config.jwt_refresh_expires_in as SignOptions
    );

    return {
        accessToken,
        refreshToken
    };
}


export const authService = {
    loginUser,
    refreshToken,
    googleLogin
}