import { Prisma } from "../../../generated/prisma/client";
import { AppError } from "../../errors/AppError";
import { prisma } from "../../lib/prisma";
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
                equals: Number(price)
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
                    email: true,
                    profile: true
                }
            }
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
            reviews: true
        }
    });

    if (!property) {
        throw new AppError(404, "Property not found");
    }

    return property;

};

const createProperty = async (payload: CreatePropertyPayload) => {
    const result = await prisma.property.create({
        data: payload
    });
    return result;
};

const updateProperty = async (id: string, payload: UpdatePropertyPayload) => {
    const property = await prisma.property.findUnique({ where: { id } });
    if (!property) {
        throw new AppError(404, "Property not found");
    }

    const result = await prisma.property.update({
        where: { id },
        data: payload
    });
    return result;
};

const deleteProperty = async (id: string) => {
    const property = await prisma.property.findUnique({ where: { id } });
    if (!property) {
        throw new AppError(404, "Property not found");
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

export const propertyService = {
    getAllProperties,
    getPropertyDetails,
    createProperty,
    updateProperty,
    deleteProperty,
    createCategory,
    deleteCategory,
    updateCategory,
    getAllCategories
};
