import { Role, RequestStatus, PaymentStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";

const getAdminOverviewDB = async () => {
    const totalUsers = await prisma.user.count();
    const totalTenants = await prisma.user.count({ where: { role: Role.TENANT } });
    const totalLandlords = await prisma.user.count({ where: { role: Role.LANDLORD } });
    
    const totalProperties = await prisma.property.count();
    
    const totalRequests = await prisma.rentalRequest.count();
    const pendingRequests = await prisma.rentalRequest.count({ where: { status: RequestStatus.PENDING } });
    const approvedRequests = await prisma.rentalRequest.count({ where: { status: RequestStatus.APPROVED } });
    const rejectedRequests = await prisma.rentalRequest.count({ where: { status: RequestStatus.REJECTED } });
    const completedRequests = await prisma.rentalRequest.count({ where: { status: RequestStatus.COMPLETED } });

    const revenueResult = await prisma.payment.aggregate({
        where: { status: PaymentStatus.SUCCESS },
        _sum: { amount: true }
    });
    const totalRevenue = revenueResult._sum.amount || 0;

    const totalReviews = await prisma.review.count();

    return {
        totalUsers,
        totalTenants,
        totalLandlords,
        totalProperties,
        totalRequests,
        pendingRequests,
        approvedRequests,
        rejectedRequests,
        completedRequests,
        totalRevenue,
        totalReviews
    };
};

const getLandlordOverviewDB = async (landlordId: string) => {
    const totalProperties = await prisma.property.count({
        where: { landLordId: landlordId }
    });

    const totalRequests = await prisma.rentalRequest.count({
        where: { property: { landLordId: landlordId } }
    });

    const pendingRequests = await prisma.rentalRequest.count({
        where: { property: { landLordId: landlordId }, status: RequestStatus.PENDING }
    });

    const approvedRequests = await prisma.rentalRequest.count({
        where: { property: { landLordId: landlordId }, status: RequestStatus.APPROVED }
    });

    const rejectedRequests = await prisma.rentalRequest.count({
        where: { property: { landLordId: landlordId }, status: RequestStatus.REJECTED }
    });

    const completedRequests = await prisma.rentalRequest.count({
        where: { property: { landLordId: landlordId }, status: RequestStatus.COMPLETED }
    });

    const revenueResult = await prisma.payment.aggregate({
        where: { 
            status: PaymentStatus.SUCCESS,
            rentalRequest: {
                property: { landLordId: landlordId }
            }
        },
        _sum: { amount: true }
    });
    const totalRevenue = revenueResult._sum.amount || 0;

    const totalReviews = await prisma.review.count({
        where: {
            rentalRequest: {
                property: { landLordId: landlordId }
            }
        }
    });

    return {
        totalProperties,
        totalRequests,
        pendingRequests,
        approvedRequests,
        rejectedRequests,
        completedRequests,
        totalRevenue,
        totalReviews
    };
};

const getTenantOverviewDB = async (tenantID: string) => {
    const totalRequests = await prisma.rentalRequest.count({
        where: { userId: tenantID }
    });

    const pendingRequests = await prisma.rentalRequest.count({
        where: { userId: tenantID, status: RequestStatus.PENDING }
    });

    const approvedRequests = await prisma.rentalRequest.count({
        where: { userId: tenantID, status: RequestStatus.APPROVED }
    });

    const rejectedRequests = await prisma.rentalRequest.count({
        where: { userId: tenantID, status: RequestStatus.REJECTED }
    });

    const completedRequests = await prisma.rentalRequest.count({
        where: { userId: tenantID, status: RequestStatus.COMPLETED }
    });

    return {
        totalRequests,
        pendingRequests,
        approvedRequests,
        rejectedRequests,
        completedRequests
    };
};

export const overviewService = {
    getAdminOverviewDB,
    getLandlordOverviewDB,
    getTenantOverviewDB
};
