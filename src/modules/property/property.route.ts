import express from "express";
import { propertyController } from "./property.controller";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";

const router = express.Router();

router.get("/", propertyController.getAllProperties);
router.post("/", auth(Role.LANDLORD), propertyController.createProperty);

router.get("/:id", propertyController.getPropertyDetails);
router.put("/:id", auth(Role.LANDLORD), propertyController.updateProperty)
router.delete("/:id", auth(Role.LANDLORD), propertyController.deleteProperty);

export const propertyRoutes = router;
