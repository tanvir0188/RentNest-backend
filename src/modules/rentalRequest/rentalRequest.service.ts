import { AppError } from "../../errors/AppError";
import { prisma } from "../../lib/prisma";

const createRentalRequestIntoDB = async (userId: string, propertyId: string) => {
    const property = await prisma.property.findUnique({
        where: { id: propertyId }
    });
    if (!property) {
        throw new AppError(404, "Property not found");
    }

    const request = await prisma.rentalRequest.create({
        data: {
            userId,
            propertyId
        }
    });

    return request;
};

const getAllRentalRequestsFromDBByUserId = async (userId: string) => {
    const result = await prisma.rentalRequest.findMany({
        where: {
            userId
        },
        include: {
            property: {
                select: {
                    title: true,
                    price: true,
                    location: true,
                }
            }
        }
    });
    return result;
};

const getRentalRequestsForLandLordDB = async (userId: string) => {
    const result = await prisma.rentalRequest.findMany({
        where: {
            property: {
                landLordId: userId
            }
        },
        include: {
            property: {
                select: {
                    title: true,
                    price: true,
                    location: true,
                }
            }
        }
    });
    return result;
}

const getRentalRequestDetailDB = async (requestId: string) => {
    const request = await prisma.rentalRequest.findUnique({
        where: { id: requestId },
        include: {
            property: {
                select: {
                    title: true,
                    price: true,
                    location: true,
                }
            },
            user: {
                select: {
                    name: true,
                    email: true,
                }
            },

        }
    });
    if (!request) {
        throw new AppError(404, "Rental request not found");
    }
    return request;
}

const getAllRentalRequestFromDb = async () => {
    const result = await prisma.rentalRequest.findMany({
        include: {
            property: {
                select: {
                    title: true,
                    price: true,
                    location: true,
                }
            },
            user: {
                select: {
                    name: true,
                    email: true,
                }
            },
        }
    });
    return result;
}

export const rentalRequestService = {
    createRentalRequestIntoDB,
    getAllRentalRequestsFromDBByUserId,
    getRentalRequestDetailDB,
    getAllRentalRequestFromDb,
    getRentalRequestsForLandLordDB
};
