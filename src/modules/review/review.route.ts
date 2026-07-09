import { Router } from "express";
import { reviewController } from "./review.controller";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";
import { validateCreateReview } from "./review.validation";

const router = Router();

router.post("/", auth(Role.TENANT), validateCreateReview, reviewController.createReview);

export const reviewRoutes = router;
