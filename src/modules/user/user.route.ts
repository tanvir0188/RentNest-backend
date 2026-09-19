import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth";
import { userController } from "./user.controller";
import { validateRegister } from "./user.validation";

import { fileUploadMiddleware } from "../../lib/cloudinary";

const router = Router();

// PUBLIC ROUTES

router.post("/register", validateRegister, userController.registerUser);

// SHARED ROUTES
router.get("/me", auth(Role.ADMIN, Role.TENANT, Role.LANDLORD), userController.getMyProfile);
router.put(
    "/profile",
    auth(Role.ADMIN, Role.TENANT, Role.LANDLORD),
    fileUploadMiddleware(["profilePhoto", "image", "file"]),
    userController.updateMyProfile
);

// ADMIN ROUTES

router.get("/", auth(Role.ADMIN), userController.getAllUsers);
router.get("/:id", auth(Role.ADMIN), userController.getUserDetails);
router.put("/admin/users/:id/toggle-status", auth(Role.ADMIN), userController.toggleUserStatus);

export const userRoutes: Router = router;