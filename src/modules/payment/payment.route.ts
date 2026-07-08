import { Router } from "express";
import { paymentController } from "./payment.controller";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

// ==============================
// TENANT ROUTES
// ==============================
router.post("/checkout-session", auth(Role.TENANT), paymentController.createCheckoutSession);

// ==============================
// PUBLIC ROUTES (Webhook)
// ==============================
router.post("/webhook", paymentController.handleWebhook);

export const paymentRoutes = router;
