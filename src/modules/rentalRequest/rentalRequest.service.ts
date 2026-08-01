import { RequestStatus, Role } from "../../../generated/prisma/enums";
import { AppError } from "../../errors/AppError";
import { prisma } from "../../lib/prisma";
import httpStatus from "http-status";

const createRentalRequestIntoDB = async (userId: string, propertyId: string, role: string) => {
    const property = await prisma.property.findUnique({
        where: { id: propertyId }
    });
    if (!property) {
        throw new AppError(httpStatus.NOT_FOUND, "Property not found");
    }

    if (role === Role.ADMIN) {
        const tenantUser = await prisma.user.findUnique({
            where: { id: userId }
        });
        if (!tenantUser) {
            throw new AppError(httpStatus.BAD_REQUEST, "The provided user ID does not exist");
        }
        if (tenantUser.role !== Role.TENANT) {
            throw new AppError(httpStatus.BAD_REQUEST, "The provided user ID does not belong to a user with the TENANT role");
        }
    }

    const existingRequest = await prisma.rentalRequest.findUnique({
        where: {
            userId_propertyId: { userId, propertyId },
        },
    });

    if (existingRequest) {
        throw new AppError(httpStatus.BAD_REQUEST, "A rental request already exists for this user and property");
    }

    const request = await prisma.rentalRequest.create({
        data: {
            userId,
            propertyId
        }
    });

    return request;
};

const getAllRentalRequestsFromDBByUserId = async (userId: string, options: any) => {
    const { page = 1, size = 10 } = options || {};
    const skip = (Number(page) - 1) * Number(size);
    const take = Number(size);

    const result = await prisma.rentalRequest.findMany({
        where: {
            userId
        },
        skip,
        take,
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

    const total = await prisma.rentalRequest.count({
        where: { userId }
    });

    return {
        meta: {
            totalItem: total,
            current_page: Number(page),
            next_page: skip + take < total ? Number(page) + 1 : null,
            page_item: result.length
        },
        data: result
    };
};

const getRentalRequestsForLandLordDB = async (userId: string, options: any) => {
    const { page = 1, size = 10 } = options || {};
    const skip = (Number(page) - 1) * Number(size);
    const take = Number(size);

    const whereCondition = {
        property: {
            landLordId: userId
        }
    };

    const result = await prisma.rentalRequest.findMany({
        where: whereCondition,
        skip,
        take,
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

    const total = await prisma.rentalRequest.count({
        where: whereCondition
    });

    return {
        meta: {
            totalItem: total,
            current_page: Number(page),
            next_page: skip + take < total ? Number(page) + 1 : null,
            page_item: result.length
        },
        data: result
    };
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
            payment: {
                select: {
                    status: true,
                    amount: true,
                    createdAt: true

                }
            }

        }
    });
    if (!request) {
        throw new AppError(404, "Rental request not found");
    }
    return request;
}

const getAllRentalRequestFromDb = async (options: any) => {
    const { page = 1, size = 10 } = options || {};
    const skip = (Number(page) - 1) * Number(size);
    const take = Number(size);

    const result = await prisma.rentalRequest.findMany({
        skip,
        take,
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

    const total = await prisma.rentalRequest.count();

    return {
        meta: {
            totalItem: total,
            current_page: Number(page),
            next_page: skip + take < total ? Number(page) + 1 : null,
            page_item: result.length
        },
        data: result
    };
}

const acceptOrRejectRentalRequestDB = async (requestId: string, userId: string, status: RequestStatus, role: string) => {
    const rentalRequest = await prisma.rentalRequest.findUnique({
        where: { id: requestId },
        include: {
            property: {
                select: {
                    landLordId: true
                }
            }
        }
    });

    if (!rentalRequest) {
        throw new AppError(httpStatus.NOT_FOUND, "Rental request not found");
    }

    // Admin can accept/reject any request; landlord can only modify their own
    if (role !== Role.ADMIN && rentalRequest.property.landLordId !== userId) {
        throw new AppError(httpStatus.FORBIDDEN, "You are not authorized to perform this action");
    }
    // Check if the request is already accepted or rejected(applies to landlord only)
    
    if (role !== Role.ADMIN && rentalRequest.status !== RequestStatus.PENDING) {
        throw new AppError(httpStatus.BAD_REQUEST, `Rental request is already ${rentalRequest.status.toLowerCase()}`);
    }

    const updatedRequest = await prisma.rentalRequest.update({
        where: { id: requestId },
        data: {
            status: status
        }
    });
    return updatedRequest.status;
}

//if the user has successfully made the payment, then mark the request as complete
const markAsCompletedDB = async (requestId: string, landLordId: string) => {
    const rentalRequest = await prisma.rentalRequest.findUnique({
        where: { id: requestId },
        include: { property: true }
    });

    if (!rentalRequest) {
        throw new AppError(404, "Rental request not found");
    }

    if (rentalRequest.property.landLordId !== landLordId) {
        throw new AppError(403, "You are not authorized to modify this request");
    }

    if (rentalRequest.status === RequestStatus.COMPLETED) {
        throw new AppError(400, "Cannot mark as completed because the request is already completed");
    }
    if (rentalRequest.status === RequestStatus.REJECTED) {
        throw new AppError(400, "Cannot mark as completed because the request is rejected");
    }
    if (rentalRequest.status === RequestStatus.PENDING) {
        throw new AppError(400, "Cannot mark as completed because the request is pending");
    }

    const updatedRequest = await prisma.rentalRequest.update({
        where: { id: requestId },
        data: {
            status: RequestStatus.COMPLETED
        }
    });

    return updatedRequest;
}

export const rentalRequestService = {
    createRentalRequestIntoDB,
    getAllRentalRequestsFromDBByUserId,
    getRentalRequestDetailDB,
    getAllRentalRequestFromDb,
    getRentalRequestsForLandLordDB,
    acceptOrRejectRentalRequestDB,
    markAsCompletedDB
};
