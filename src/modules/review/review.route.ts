import { Router } from "express";
import { reviewController } from "./review.controller";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";
import { validateCreateReview } from "./review.validation";

const router = Router();

// TENANT ROUTES
router.post("/", auth(Role.TENANT), validateCreateReview, reviewController.createReview);
router.patch("/:id", auth(Role.TENANT), reviewController.updateReview);

// ADMIN ROUTES
router.post("/admin", auth(Role.ADMIN), validateCreateReview, reviewController.createReview);
router.patch("/admin/:id", auth(Role.ADMIN), reviewController.updateReview);

export const reviewRoutes = router;
