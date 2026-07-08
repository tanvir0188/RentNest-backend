import express from "express";
import { propertyController } from "./property.controller";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";

const router = express.Router();

router.get("/properties", propertyController.getAllProperties);
router.post("/properties", auth(Role.LANDLORD), propertyController.createProperty);

router.post("/category", auth(Role.LANDLORD, Role.ADMIN), propertyController.createCategory);
router.get("/categories", propertyController.getAllCategories);

router.get("/properties/:id", propertyController.getPropertyDetails);
router.put("/properties/:id", auth(Role.LANDLORD), propertyController.updateProperty)
router.delete("/properties/:id", auth(Role.LANDLORD), propertyController.deleteProperty);

export const propertyRoutes = router;
