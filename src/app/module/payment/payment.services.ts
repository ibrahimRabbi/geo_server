import Stripe from "stripe";
import envData from "../../config";
 

export type TcreateCheckoutSession = {
    amount: number;
    currency?: string;
    productName: string;
    bookingId: string;
    success_url: string;
    cancel_url : string
}

export const createCheckoutSessionService = async (payload: TcreateCheckoutSession) => {

    const stripe = new Stripe(envData.stripe_secret_key as string)
    const { amount, currency = "usd", productName, bookingId, success_url, cancel_url } = payload;

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
        success_url: `${success_url}` + `?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${cancel_url}`,
    });

    return {
        sessionId: session.id,
        url: session.url,
    };
};