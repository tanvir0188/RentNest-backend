import { Router } from "express";
import { paymentController } from "./payment.controller";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

// ==============================
// TENANT & ADMIN ROUTES
// ==============================
router.post("/checkout-session/:id", auth(Role.TENANT), paymentController.createCheckoutSession);
router.get("/payments/:id", auth(Role.TENANT, Role.ADMIN), paymentController.getPaymentById);
router.get("/payments", auth(Role.TENANT, Role.ADMIN), paymentController.getPaymentListByTenant);

// ==============================
// ADMIN ROUTES
// ==============================
router.patch("/admin/payments/:id/status", auth(Role.ADMIN), paymentController.changePaymentStatus);

// ==============================
// PUBLIC ROUTES (Webhook)
// ==============================
router.post("/webhook", paymentController.handleWebhook);

export const paymentRoutes = router;
