import { RequestHandler } from "express";
import { catchAsync } from "../../helper/catchAsync";
import Stripe from "stripe";
import envData from "../../config";
import status from "http-status";
import { bookingToureModel } from "./bookingTour.model";
import { TbookingTour } from "./bookingTour.interface";

const stripe = new Stripe(envData.stripe_secret_key as string);

export const verifyTourBookingController: RequestHandler = catchAsync(async (req, res) => {

    const { sessionId } = req.body;


    const session = await stripe.checkout.sessions.retrieve(sessionId);
    console.log(session)
    if (session.payment_status !== 'paid') {
        return res.status(status.PAYMENT_REQUIRED).json({
            status: status.PAYMENT_REQUIRED,
            success: false,
            message: 'Payment not completed for this session.',
            paymentStatus: session.payment_status,
        });
    }


    const data: Partial<TbookingTour> = {
        userId: req?.user?._id,
        packageId: session.metadata?.bookingId as any,
        paymentIntentId: session.payment_intent as string,
        stripeSessionId: sessionId,
        isPaid: true,
    }

    const creatingTourOrder = await bookingToureModel.create(data)

    res.status(status.OK).json({
        status: status.OK,
        success: true,
        message: 'Booking confirmed',
        data: creatingTourOrder,
    });

})