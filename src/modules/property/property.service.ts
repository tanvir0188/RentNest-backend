import { Prisma } from "../../../generated/prisma/client";
import { Role } from "../../../generated/prisma/enums";
import { AppError } from "../../errors/AppError";
import { prisma } from "../../lib/prisma";
import httpStatus from "http-status";
import { CreatePropertyPayload, UpdatePropertyPayload, type CategoryPayload } from "./property.interface";

const getAllProperties = async (filters: any, options: any) => {
    const { page = 1, size = 10 } = options;
    const skip = (Number(page) - 1) * Number(size);
    const take = Number(size);

    const { location, price, type } = filters;

    const andConditions: Prisma.PropertyWhereInput[] = [];

    if (location) {
        andConditions.push({
            location: {
                contains: location
            }
        });
    }

    if (type) {
        andConditions.push({
            type: {
                equals: type
            }
        });
    }

    if (price) {
        andConditions.push({
            price: {               
                lte: Number(price)                
            }
        });
    }

    const whereConditions: Prisma.PropertyWhereInput =
        andConditions.length > 0 ? { AND: andConditions } : {};

    const properties = await prisma.property.findMany({
        where: whereConditions,
        skip,
        take,
        include: {
            category: true,
            landLord: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            },
            amenities: true
        }
    });

    const total = await prisma.property.count({
        where: whereConditions
    });

    return {
        meta: {
            page: Number(page),
            size: Number(size),
            total,
            totalPages: Math.ceil(total / Number(size))
        },
        data: properties
    };
};

const getPropertyDetails = async (id: string) => {
    const property = await prisma.property.findUnique({
        where: { id },
        include: {
            category: true,
            landLord: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    profile: true
                }
            },
            reviews: {
                select: {
                    id: true,
                    rating: true,
                    comment: true,
                    user: {
                        select: {
                            name: true
                        }
                    }
                }
            },
            amenities: true
        }
    });

    if (!property) {
        throw new AppError(404, "Property not found");
    }

    return property;

};

const getPropertiesForLandlord = async (landLordId: string) => {
    const properties = await prisma.property.findMany({
        where: { landLordId },
        include: {
            category: true,
            amenities: true,
            reviews: true
        }
    });
    return properties;
};


const createProperty = async (payload: CreatePropertyPayload, landLordId: string) => {
    const { amenities, ...propertyData } = payload;
    const result = await prisma.property.create({
        data: {
            ...propertyData,
            landLordId,
            ...(amenities && amenities.length > 0 && {
                amenities: {
                    connect: amenities.map(id => ({ id }))
                }
            })
        },
        include: { amenities: true }
    });
    return result;
};

const updateProperty = async (id: string, payload: UpdatePropertyPayload, userId: string, role: string) => {
    const property = await prisma.property.findUnique({ where: { id } });
    if (!property) {
        throw new AppError(httpStatus.NOT_FOUND, "Property not found");
    }

    if (role === Role.ADMIN) {
        if (payload.landLordId) {
            const landlordUser = await prisma.user.findUnique({
                where: { id: payload.landLordId }
            });
            if (!landlordUser) {
                throw new AppError(httpStatus.BAD_REQUEST, "The provided landlord user ID does not exist");
            }
            if (landlordUser.role !== Role.LANDLORD) {
                throw new AppError(httpStatus.BAD_REQUEST, "The provided user ID does not belong to a user with the LANDLORD role");
            }
        }
    } else if (property.landLordId !== userId) {
        throw new AppError(httpStatus.FORBIDDEN, "You do not have permission to update this property");
    }

    const { amenities, landLordId, ...propertyData } = payload;

    const result = await prisma.property.update({
        where: { id },
        data: {
            ...propertyData,
            ...(amenities && {
                amenities: {
                    set: amenities.map(amenityId => ({ id: amenityId }))
                }
            })
        },
        include: { amenities: true }
    });
    return result;
};

const deleteProperty = async (id: string, userId: string, role: string) => {
    const property = await prisma.property.findUnique({ where: { id } });
    if (!property) {
        throw new AppError(404, "Property not found");
    }

    if (property.landLordId !== userId && role !== "ADMIN") {
        throw new AppError(403, "You do not have permission to delete this property");
    }

    const result = await prisma.property.delete({
        where: { id }
    });
    return result;
};

const createCategory = async (payload: CategoryPayload) => {
    const isCategoryExist = await prisma.category.findUnique({
        where: { title: payload.title }
    });

    if (isCategoryExist) {
        throw new AppError(400, "Category with this title already exists");
    }

    const result = await prisma.category.create({
        data: payload
    });
    return result;
};

const deleteCategory = async (id: string) => {
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) {
        throw new AppError(404, "Category not found");
    }

    const result = await prisma.category.delete({
        where: { id }
    });
    return result;
};

const updateCategory = async (id: string, payload: CategoryPayload) => {
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) {
        throw new AppError(404, "Category not found");
    }

    const isTitleExists = await prisma.category.findUnique({
        where: { title: payload.title }
    })

    if (isTitleExists && isTitleExists.id !== id) {
        throw new AppError(400, "Category with this title already exists");
    }

    const result = await prisma.category.update({
        where: { id },
        data: payload
    });
    return result;
};

const getAllCategories = async () => {
    const result = await prisma.category.findMany();
    return result;
};

const createAmenity = async (payload: { title: string }) => {
    console.log("payload: ", payload);
    const isExist = await prisma.amenity.findUnique({
        where: { title: payload.title }
    });
    if (isExist) {
        throw new AppError(400, "Amenity with this title already exists");
    }
    const result = await prisma.amenity.create({
        data: payload
    });
    return result;
};

const getAllAmenities = async () => {
    const result = await prisma.amenity.findMany();
    return result;
};

const updateAmenity = async (id: string, payload: { title: string }) => {
    const amenity = await prisma.amenity.findUnique({ where: { id } });
    if (!amenity) {
        throw new AppError(404, "Amenity not found");
    }

    if (payload.title) {
        const isTitleExists = await prisma.amenity.findUnique({
            where: { title: payload.title }
        });

        if (isTitleExists && isTitleExists.id !== id) {
            throw new AppError(400, "Amenity with this title already exists");
        }
    }

    const result = await prisma.amenity.update({
        where: { id },
        data: payload
    });
    return result;
};

const deleteAmenity = async (id: string) => {
    const amenity = await prisma.amenity.findUnique({ where: { id } });
    if (!amenity) {
        throw new AppError(404, "Amenity not found");
    }

    const result = await prisma.amenity.delete({
        where: { id }
    });
    return result;
};

export const propertyService = {
    getAllProperties,
    getPropertyDetails,
    getPropertiesForLandlord,
    createProperty,
    updateProperty,
    deleteProperty,
    createCategory,
    deleteCategory,
    updateCategory,
    getAllCategories,
    createAmenity,
    getAllAmenities,
    updateAmenity,
    deleteAmenity
};
