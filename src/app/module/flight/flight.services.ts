
import Stripe from "stripe";
import { TcreateCheckoutSession } from "./flight.interface";
import envData from "../../config";




export const createCheckoutSessionService = async (payload: TcreateCheckoutSession) => {

    const stripe = new Stripe(envData.stripe_secret_key as string)
    const { amount, currency = "usd", productName, bookingId, } = payload;

    const session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: [
            {
                price_data: {
                    currency,
                    product_data: {
                        name: productName,
                    },
                    unit_amount: amount * 100,
                },

                quantity: 1,
            },
        ],
        metadata: { bookingId },
        success_url: `http://localhost:3000/payment/success` + `?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `http://localhost:3000/payment/cancel`,
    });

    return {
        sessionId: session.id,
        url: session.url,
    };
};
