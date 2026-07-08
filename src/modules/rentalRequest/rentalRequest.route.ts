import { Router } from "express";
import { rentalRequestController } from "./rentalRequest.controller";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.post("/rentals", auth(Role.TENANT), rentalRequestController.createRentalRequest);
router.get("/rentals", auth(Role.TENANT), rentalRequestController.getAllRentalRequestsByTenant);
router.get("/rentals/:id", auth(Role.LANDLORD, Role.TENANT, Role.ADMIN), rentalRequestController.getRentalRequestDetail);
router.get("/landlord/requests", auth(Role.LANDLORD), rentalRequestController.getAllRentalRequestsByLandLord);
router.get("/admin/rentals", auth(Role.ADMIN), rentalRequestController.getAllRequests);

export const rentalRequestRoutes = router;
