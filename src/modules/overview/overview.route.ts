import { Router } from "express";
import { overviewController } from "./overview.controller";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

// ADMIN ROUTES
router.get("/admin/overview", auth(Role.ADMIN), overviewController.getAdminOverview);

// LANDLORD ROUTES
router.get("/landlord/overview", auth(Role.LANDLORD), overviewController.getLandlordOverview);

// TENANT ROUTES
router.get("/tenant/overview", auth(Role.TENANT), overviewController.getTenantOverview);

export const overviewRoutes = router;
