import { Router } from "express";
import { rentalRequestController } from "./rentalRequest.controller";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

// TENANT ROUTES
router.post("/rentals/:id", auth(Role.TENANT), rentalRequestController.createRentalRequest);
router.get("/rentals", auth(Role.TENANT), rentalRequestController.getAllRentalRequestsByTenant);

// LANDLORD ROUTES
router.get("/landlord/requests", auth(Role.LANDLORD), rentalRequestController.getAllRentalRequestsByLandLord);
router.patch("/landlord/requests/:id", auth(Role.LANDLORD), rentalRequestController.acceptOrRejectRentalRequest);
router.patch("/landlord/requests/complete/:id/", auth(Role.LANDLORD), rentalRequestController.markAsCompleted);

// ADMIN ROUTES
router.get("/admin/rentals", auth(Role.ADMIN), rentalRequestController.getAllRequests);

// SHARED ROUTES
router.get("/rentals/:id", auth(Role.LANDLORD, Role.TENANT, Role.ADMIN), rentalRequestController.getRentalRequestDetail);

export const rentalRequestRoutes = router;
