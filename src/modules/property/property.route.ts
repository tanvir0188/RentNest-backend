import express from "express";
import { propertyController } from "./property.controller";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";
import { validateCreateProperty, validateCreateCategory, validateCreateAmenity } from "./property.validation";

const router = express.Router();

// PUBLIC ROUTES

router.get("/properties", propertyController.getAllProperties);
router.get("/properties/:id", propertyController.getPropertyDetails);
router.get("/categories", propertyController.getAllCategories);
router.get("/amenities", propertyController.getAllAmenities);


// LANDLORD ROUTES

router.get("/landlord/properties", auth(Role.LANDLORD), propertyController.getPropertiesForLandlord);
router.post("/landlord/properties", auth(Role.LANDLORD), validateCreateProperty, propertyController.createProperty);
router.put("/landlord/properties/:id", auth(Role.LANDLORD), propertyController.updateProperty);
router.delete("/landlord/properties/:id", auth(Role.LANDLORD), propertyController.deleteProperty);

// ADMIN ROUTES

router.post("/admin/category", auth(Role.ADMIN), validateCreateCategory, propertyController.createCategory);
router.put("/admin/category/:id", auth(Role.ADMIN), propertyController.updateCategory);
router.delete("/admin/category/:id", auth(Role.ADMIN), propertyController.deleteCategory);
router.post("/admin/amenity", auth(Role.ADMIN), validateCreateAmenity, propertyController.createAmenity);

export const propertyRoutes = router;
