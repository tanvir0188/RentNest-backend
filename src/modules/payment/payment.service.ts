import Stripe from "stripe";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../errors/AppError";
import { Request, Response } from "express";
import { PaymentStatus, RequestStatus } from "../../../generated/prisma/enums";
import httpStatus from "http-status";

const stripe = new Stripe(config.stripe_secret_key);

const createCheckoutSessionStripe = async (userId: string, rentalRequestId: string) => {
    const user = await prisma.user.findUnique({
        where: { id: userId }
    });

    const rentalRequest = await prisma.rentalRequest.findUnique({
        where: { id: rentalRequestId },
        select: {
            property: {
                select: {
                    price: true,
                    title: true
                }
            },
            status: true
        }
    });

    if (!user) {
        throw new AppError(404, "User not found");
    }
    if (!rentalRequest) {
        throw new AppError(404, "Rental request not found");
    }

    const existingPayment = await prisma.payment.findFirst({
        where: {
            rentalRequestId: rentalRequestId,
            status: PaymentStatus.SUCCESS
        }
    });

    if (existingPayment) {
        throw new AppError(400, "Payment has already been made for this rental request.");
    }
    if (rentalRequest.status !== RequestStatus.APPROVED) {
        throw new AppError(400, "Rental request is not approved");
    }
    const price = rentalRequest.property.price;
    console.log('price from db', price)

    const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
    });

    const amountInCents = Math.round(price);

    const session = await stripe.checkout.sessions.create({
        customer: customer.id,
        line_items: [
            {
                price_data: {
                    currency: 'bdt',
                    product_data: {
                        name: 'Rental Payment',
                        description: `Payment for rental request ${rentalRequest.property.title}`,
                    },
                    unit_amount: amountInCents * 100,
                },
                quantity: 1,
            },
        ],
        mode: 'payment',
        success_url: `https://novel-fresh-spaniel.ngrok-free.app/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `https://novel-fresh-spaniel.ngrok-free.app/payment/cancel`,
        metadata: {
            userId,
            rentalRequestId,
        },
    });

    return {
        sessionId: session.id,
        url: session.url,
        customer: customer.id,
    };
};

const listenWebhookAndStoreIntoDB = async (req: Request, res: Response) => {

    const sig = req.headers['stripe-signature'] as string;
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            config.stripe_webhook_secret
        );
    } catch (err) {
        console.error("Webhook signature verification failed", err);
        return res.status(400).send('Webhook Error');
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        console.log(`event: ${event}`)

        const { userId, rentalRequestId } = session.metadata as {
            userId: string;
            rentalRequestId: string;
        };

        const amount = (session.amount_total as number) / 100;
        const paymentMethod = session.payment_method_types?.[0] || 'card';
        const customerId = session.customer as string;

        await prisma.$transaction(async (tx) => {
            await tx.payment.create({
                data: {
                    userId,
                    stripePaymentIntentId: session.payment_intent as string,
                    amount,
                    paymentMethod: paymentMethod,
                    stripeCustomerId: customerId,
                    rentalRequestId,
                    status: PaymentStatus.SUCCESS,
                },
            });
            await tx.rentalRequest.update({
                where: { id: rentalRequestId },
                data: {
                    status: RequestStatus.ACTIVE,
                },
            });
        });
    }


    res.status(200).send('Webhook received successfully');
}

const getPaymentByIdDB = async (id: string, userId: string, role: string) => {
    const payment = await prisma.payment.findUnique({
        where: { id: id },
        include: {
            rentalRequest: {
                select: {
                    createdAt: true,
                    updatedAt: true,
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
            }
        }
    });

    if (!payment) {
        throw new AppError(404, "Payment not found");
    }

    if (role !== 'ADMIN' && payment.userId !== userId) {
        throw new AppError(403, "You are not authorized to view this payment");
    }

    return payment;
}

const getPaymentListDB = async (userId: string, role: string) => {
    const payments = await prisma.payment.findMany({
        where: role === 'ADMIN' ? {} : { userId: userId },
        include: {
            rentalRequest: {
                select: {
                    createdAt: true,
                    updatedAt: true,
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
            }
        }
    });
    return payments;
}

const changePaymentStatusDB = async (paymentId: string, status: string) => {
    const validStatuses = Object.values(PaymentStatus);
    if (!validStatuses.includes(status as PaymentStatus)) {
        throw new AppError(httpStatus.BAD_REQUEST, `Invalid payment status. Valid statuses are: ${validStatuses.join(', ')}`);
    }

    const payment = await prisma.payment.findUnique({
        where: { id: paymentId }
    });

    if (!payment) {
        throw new AppError(httpStatus.NOT_FOUND, "Payment not found");
    }

    const updatedPayment = await prisma.payment.update({
        where: { id: paymentId },
        data: { status: status as PaymentStatus }
    });

    return updatedPayment;
}

export const paymentService = {
    createCheckoutSessionStripe,
    listenWebhookAndStoreIntoDB,
    getPaymentByIdDB,
    getPaymentListDB,
    changePaymentStatusDB
};