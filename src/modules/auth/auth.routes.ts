import { Router } from "express";
import { authController } from "./auth.controller";

import { validateLogin } from "./auth.validation";

import passport from "passport";

const router = Router();

// PUBLIC ROUTES
router.post("/login", validateLogin, authController.loginUser);
router.post("/refresh-token", authController.refreshToken);

// GOOGLE OAUTH ROUTES
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get("/google/callback", passport.authenticate("google", { failureRedirect: "/login" }), authController.googleAuthCallback);

export const authRoutes: Router = router;