import { NextFunction, Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import { Role } from "../../generated/prisma/enums";
import config from "../config";
import { prisma } from "../lib/prisma";
import { catchAsync } from "../utils/catchAsync";
import { jwtUtils } from "../utils/jwt";
import { AppError } from "../errors/AppError";

declare global {
    namespace Express {
        interface Request {
            user?: {
                email: string;
                name: string;
                id: string;
                role: Role;
            }
        }
    }
}

// auth(Role.ADMIN, Role.USER, Role.Author)
// auth() => ...requiredRoles => [Role.ADMIN, Role.USER, Role.AUTHOR]
export const auth = (...requiredRoles: Role[]) => {
    return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const token = req.cookies.accessToken ?
            req.cookies.accessToken
            :
            req.headers.authorization?.startsWith("Bearer ") ?
                req.headers.authorization?.split(" ")[1]
                : req.headers.authorization;

        if (!token) {
            throw new AppError(400, "You are not logged in. Please log in to access this resource.");
        }

        const verifiedToken = jwtUtils.verifyToken(token, config.jwt_access_secret);

        if (!verifiedToken.success) {

            throw new AppError(401, verifiedToken.error);
        }

        const { email, name, id, role } = verifiedToken.data as JwtPayload;

        if (requiredRoles.length && !requiredRoles.includes(role)) {
            throw new AppError(403, "Forbidden. You don't have permission to access this resource.");
        }

        const user = await prisma.user.findUnique({
            where: {
                id,
                email
            }
        });

        if (!user) {
            throw new AppError(404, "User not found.");
        }

        if (user.activeStatus === "BLOCKED") {
            throw new AppError(403, "Your account has been blocked. Please contact support.");
        }

        req.user = {
            email,
            name,
            id,
            role
        }

        next();

    }
    )
}
