import express, { Router } from "express";
import { propertyController } from "./property.controller";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";
import { validateCreateProperty, validateCreateCategory, validateCreateAmenity } from "./property.validation";
import { fileUploadMiddleware } from "../../lib/cloudinary";

const router = express.Router();

// PUBLIC ROUTES

router.get("/properties", propertyController.getAllProperties);
router.get("/properties/:id", propertyController.getPropertyDetails);
router.get("/filters", propertyController.getFilters);


// LANDLORD ROUTES

router.get("/landlord/properties", auth(Role.LANDLORD), propertyController.getPropertiesForLandlord);
router.post(
    "/landlord/properties",
    auth(Role.LANDLORD),
    fileUploadMiddleware(["image", "file"]),
    validateCreateProperty,
    propertyController.createProperty
);
router.put(
    "/landlord/properties/:id",
    auth(Role.LANDLORD, Role.ADMIN),
    fileUploadMiddleware(["image", "file"]),
    propertyController.updateProperty
);
router.delete("/landlord/properties/:id", auth(Role.LANDLORD, Role.ADMIN), propertyController.deleteProperty);

// ADMIN ROUTES

router.post("/admin/category", auth(Role.ADMIN), validateCreateCategory, propertyController.createCategory);
router.put("/admin/category/:id", auth(Role.ADMIN), propertyController.updateCategory);
router.delete("/admin/category/:id", auth(Role.ADMIN), propertyController.deleteCategory);
router.post("/admin/amenity", auth(Role.ADMIN), validateCreateAmenity, propertyController.createAmenity);
router.put("/admin/amenity/:id", auth(Role.ADMIN), propertyController.updateAmenity);
router.delete("/admin/amenity/:id", auth(Role.ADMIN), propertyController.deleteAmenity);

export const propertyRoutes: Router = router;
