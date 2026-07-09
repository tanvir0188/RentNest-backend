import { Router } from "express";
import { authController } from "./auth.controller";

import { validateLogin } from "./auth.validation";

const router = Router();

// PUBLIC ROUTES
router.post("/login", validateLogin, authController.loginUser);
router.post("/refresh-token", authController.refreshToken);

export const authRoutes = router;