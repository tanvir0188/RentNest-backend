import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth";
import { userController } from "./user.controller";

const router = Router();

// PUBLIC ROUTES

router.post("/register", userController.registerUser);

// ADMIN ROUTES

router.get("/users", auth(Role.ADMIN), userController.getAllUsers);
router.put("/users/:id/toggle-status", auth(Role.ADMIN), userController.toggleUserStatus);


// SHARED ROUTES

router.get("/me", auth(Role.ADMIN, Role.TENANT, Role.LANDLORD), userController.getMyProfile);
router.put("/profile", auth(Role.ADMIN, Role.TENANT, Role.LANDLORD), userController.updateMyProfile);

export const userRoutes = router;