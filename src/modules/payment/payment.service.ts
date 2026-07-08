import Stripe from "stripe";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../errors/AppError";
import { Request, Response } from "express";
import { PaymentStatus, RequestStatus } from "../../../generated/prisma/enums";

const stripe = new Stripe(config.stripe_secret_key);

const createCheckoutSessionStripe = async (userId: string, price: number, rentalRequestId: string) => {
    const user = await prisma.user.findUnique({
        where: { id: userId }
    });

    if (!user) {
        throw new AppError(404, "User not found");
    }

    const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
    });

    const amountInCents = Math.round(price * 100);

    const session = await stripe.checkout.sessions.create({
        customer: customer.id,
        line_items: [
            {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: 'Rental Payment',
                        description: `Payment for rental request ${rentalRequestId}`,
                    },
                    unit_amount: amountInCents,
                },
                quantity: 1,
            },
        ],
        mode: 'payment',
        success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
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

        // Create payment record in database
        await prisma.payment.create({
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

        // Update rental request status
        await prisma.rentalRequest.update({
            where: { id: rentalRequestId },
            data: {
                status: RequestStatus.APPROVED,
            },
        });
    }


    res.status(200).send('Webhook received successfully');
}

export const paymentService = {
    createCheckoutSessionStripe,
    listenWebhookAndStoreIntoDB
};